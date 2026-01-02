import { GoogleGenAI, Type } from "@google/genai";
import { BillAnalysis, PurchaseImpact } from '../types';

// Initialize with a check for the API key to avoid crashing on boot
const genAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const PERSONA_PROMPTS: Record<string, string> = {
  'Chanakya': `You are Acharya Chanakya. Speak in a mix of Hindi and English (Hinglish). Use words like 'Vats', 'Dhan', 'Arth', 'Niti'. 
  STYLE GUIDE:
  - Be strategic, ruthless about waste, and wise.
  - Metaphors from Arthashastra.
  - Highlight key terms in bold.`,
  'Krishna': `You are Lord Krishna. Speak calmly. Use 'Parth' to address the user. Focus on Karma and detachment from market anxiety.`,
  'Vivekananda': `You are Swami Vivekananda. Energy, inspiration, character, and strength.`,
  'Gandhi': `You are Mahatma Gandhi. Simplicity, truth, needs vs greed.`,
  'Einstein': `You are Albert Einstein. Compound interest is the 8th wonder. Math metaphors.`,
  'Shri Ram': `You are Maryada Purushottam Shri Ram. Dharma, duty, righteousness.`
};

export const getFinancialAdvice = async (
  query: string,
  history: { role: 'user' | 'model'; text: string }[],
  persona: string = 'Chanakya'
): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "API Key not configured.";

    const systemInstruction = `
      ${PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['Chanakya']}
      1. Keep advice practical for India.
      2. Use bold for emphasis.
      3. Use Google Search for trends.
    `;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: query }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Mera dhyan bhang ho gaya hai.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sanchaar mein badha aa gayi hai.";
  }
};

export const analyzeBillImage = async (base64Image: string, mimeType: string): Promise<BillAnalysis | null> => {
  try {
    const ai = genAI();
    if (!ai) return null;

    const prompt = `Analyze this image of a receipt. Extract Merchant, Total, Date, and items. Categorize as Food/Transport/Shopping/Health/Entertainment/Bills/Other. Return JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            total: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["merchant", "total", "category"]
        }
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    return null;
  }
};

export const generateCreativeBill = async (items: string): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "AI unavailable.";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a humorous, fancy "Invoice" for homemade items: ${items}. Merchant: "Maa Ka Pyaar". Indian context (Rupees).`,
    });
    return response.text || "Could not generate.";
  } catch (error) { return "Error generating bill."; }
};

export const analyzePurchaseImpact = async (item: string, price: number, currency: string): Promise<PurchaseImpact | null> => {
  try {
    const ai = genAI();
    if (!ai) return null;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze purchase of "${item}" costing ${currency}${price} on Health, Social, Utility, Sustainability (0-100). Provide Verdict and Alternative. JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                healthScore: { type: Type.NUMBER },
                socialScore: { type: Type.NUMBER },
                utilityScore: { type: Type.NUMBER },
                sustainabilityScore: { type: Type.NUMBER },
                verdict: { type: Type.STRING },
                alternativeSuggestion: { type: Type.STRING }
            },
            required: ["healthScore", "socialScore", "utilityScore", "sustainabilityScore", "verdict", "alternativeSuggestion"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) { return null; }
};

export const getMarketNews = async (): Promise<string[]> => {
  try {
    const ai = genAI();
    if (!ai) return ["News unavailable."];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Top 3 India financial headlines today. Bullet points.",
      config: { tools: [{ googleSearch: {} }] }
    });
    const lines = (response.text || "").split('\n').filter(l => l.includes('*') || l.includes('•')).slice(0, 3);
    return lines.length > 0 ? lines : ["Markets are dynamic.", "Stay focused on goals.", "Diversification is key."];
  } catch (error) { return ["Check connection for live news."]; }
};

export const getSpendingInsight = async (category: string, amount: number): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "Be wise.";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Spent ${amount} on '${category}'. Witty Chanakya one-liner advice. 15 words max.`
    });
    return response.text || "Be frugal.";
  } catch (error) { return "Be wise."; }
};

export const getGoldPrice = async (): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "72,000";
    const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: "Current 10g Gold price in India INR? Number only.",
       config: { tools: [{ googleSearch: {} }] }
    });
    return response.text?.match(/[\d,]+/)?.[0] || "72,000";
  } catch (e) { return "72,000"; }
}

export const estimateYoutubeIncome = async (niche: string, views: number, uploadsPerMonth: number): Promise<{ low: number, high: number, explanation: string }> => {
  try {
    const ai = genAI();
    if (!ai) throw new Error();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Youtube Adsense estimate (INR) for niche "${niche}", ${views} views/video, ${uploadsPerMonth} uploads. JSON.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    low: { type: Type.NUMBER },
                    high: { type: Type.NUMBER },
                    explanation: { type: Type.STRING }
                },
                required: ["low", "high", "explanation"]
            }
        }
    });
    return response.text ? JSON.parse(response.text) : { low: 0, high: 0, explanation: "Error" };
  } catch (e) { return { low: 0, high: 0, explanation: "Error" }; }
};

export const checkFundOverlap = async (funds: string): Promise<string> => {
   try {
     const ai = genAI();
     if (!ai) return "N/A";
     const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Portfolio overlap for: ${funds}. Duplicate exposures?`,
        config: { tools: [{ googleSearch: {} }] }
     });
     return response.text || "N/A";
   } catch(e) { return "N/A"; }
};
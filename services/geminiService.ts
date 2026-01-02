
import { GoogleGenAI, Type } from "@google/genai";
import { BillAnalysis, PurchaseImpact } from '../types';

const genAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Environment variable not found.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

const PERSONA_PROMPTS: Record<string, string> = {
  'Chanakya': `You are Acharya Chanakya. Speak in a mix of Hindi and English (Hinglish). Use words like 'Vats', 'Dhan', 'Arth', 'Niti'. Be strategic and wise.`,
  'Krishna': `You are Lord Krishna. Speak calmly. Use 'Parth' to address the user. Focus on Karma and detachment.`,
  'Vivekananda': `You are Swami Vivekananda. Focus on strength, character, and inspiration.`,
  'Gandhi': `You are Mahatma Gandhi. Simplicity, truth, needs vs greed.`,
  'Einstein': `You are Albert Einstein. Math metaphors and relativity.`,
  'Shri Ram': `You are Maryada Purushottam Shri Ram. Dharma and duty.`
};

export const getFinancialAdvice = async (
  query: string,
  history: { role: 'user' | 'model'; text: string }[],
  persona: string = 'Chanakya'
): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "API Key not configured. Please contact the administrator.";

    const systemInstruction = `
      ${PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['Chanakya']}
      1. Practical advice for modern India.
      2. Use bold for key financial terms.
      3. Use Google Search for current trends.
    `;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: query }] });

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Connection lost to the ancient scrolls.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sanchaar mein badha aa gayi hai. Please try again.";
  }
};

export const getMarketNews = async (): Promise<string[]> => {
  try {
    const ai = genAI();
    if (!ai) return ["Set API_KEY in dashboard."];
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: "Top 3 India financial headlines today. Do NOT use markdown symbols like * or •. Return each headline on a new line. Focus on Sensex, Nifty, and major IPOs.",
      config: { tools: [{ googleSearch: {} }] }
    });
    const lines = (response.text || "").split('\n').map(l => l.trim()).filter(l => l.length > 5).slice(0, 3);
    return lines.length > 0 ? lines : ["Markets are showing stable growth.", "New fintech regulations coming soon.", "Investment flows remain strong in India."];
  } catch (error) { return ["Connect to internet for live news."]; }
};

export const getSpendingInsight = async (category: string, amount: number): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "Knowledge is the real wealth.";
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Spent ${amount} on '${category}'. Give a sharp Chanakya one-liner advice (max 15 words).`
    });
    return response.text || "Be mindful of expenses.";
  } catch (error) { return "Be wise."; }
};

export const getGoldPrice = async (): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "72,500";
    const response = await ai.models.generateContent({
       model: FLASH_MODEL,
       contents: "Current 24k 10g Gold price in India INR. Just the number.",
       config: { tools: [{ googleSearch: {} }] }
    });
    return response.text?.match(/[\d,]+/)?.[0] || "72,500";
  } catch (e) { return "72,500"; }
};

export const analyzeBillImage = async (base64Image: string, mimeType: string): Promise<BillAnalysis | null> => {
  try {
    const ai = genAI();
    if (!ai) return null;

    const prompt = `Analyze this image of a receipt. Extract Merchant, Total, Date, and items. Categorize accurately. Return JSON.`;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
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

export const analyzePurchaseImpact = async (item: string, price: number, currency: string): Promise<PurchaseImpact | null> => {
  try {
    const ai = genAI();
    if (!ai) return null;
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Analyze purchase of "${item}" costing ${currency}${price} on Health, Social, Utility, Sustainability. Return JSON.`,
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

export const estimateYoutubeIncome = async (niche: string, views: number, uploadsPerMonth: number): Promise<{ low: number, high: number, explanation: string }> => {
  try {
    const ai = genAI();
    if (!ai) throw new Error();
    const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Youtube income estimate for ${niche} niche with ${views} views. JSON.`,
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
    return response.text ? JSON.parse(response.text) : { low: 0, high: 0, explanation: "N/A" };
  } catch (e) { return { low: 0, high: 0, explanation: "N/A" }; }
};

export const checkFundOverlap = async (funds: string): Promise<string> => {
   try {
     const ai = genAI();
     if (!ai) return "N/A";
     const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: `Compare these funds for overlap: ${funds}. Be precise.`,
        config: { tools: [{ googleSearch: {} }] }
     });
     return response.text || "N/A";
   } catch(e) { return "N/A"; }
};

export const generateCreativeBill = async (items: string): Promise<string> => {
  try {
    const ai = genAI();
    if (!ai) return "Love is the only currency here.";
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Generate a creative, humorous "Mom Style" invoice for these items: ${items}. 
      Include items like "100 Hugs", "Zero Tantrums", or "Clean Room" as prices for these motherly services. 
      Format it clearly as a text-based receipt with dashes and pipes. 
      Keep it warm, witty, and funny. Max 150 words.`
    });
    return response.text || "Pyaar hi kaafi hai.";
  } catch (e) { return "Mom's kitchen is free of cost, but full of love."; }
};

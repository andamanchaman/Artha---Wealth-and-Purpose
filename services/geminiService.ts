import { GoogleGenAI, Type } from "@google/genai";
import { BillAnalysis, PurchaseImpact } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PERSONA_PROMPTS: Record<string, string> = {
  'Chanakya': `You are Acharya Chanakya. Speak in a mix of Hindi and English (Hinglish). Use words like 'Vats', 'Dhan', 'Arth', 'Niti'. 
  
  STYLE GUIDE:
  - Be strategic, ruthless about waste, and wise.
  - Use metaphors from the Arthashastra.
  - Example: "Vats, dhan ka sanchay hi aapatkaal ka mitra hai."
  - **Always highlight key financial terms in bold.**
  - Use bullet points for steps.`,

  'Krishna': `You are Lord Krishna. Speak calmly and philosophically. Use 'Parth' to address the user. 
  
  STYLE GUIDE:
  - Focus on 'Karma' (Duty/Investing) and detachment from anxiety (Market ups/downs).
  - Speak in soothing Hinglish.
  - Guide them to do their duty without fear.
  - **Bold** important concepts like **Compounding** or **Patience**.`,

  'Vivekananda': `You are Swami Vivekananda. Speak with great energy and inspiration. 
  
  STYLE GUIDE:
  - Focus on strength, character, and fearlessness.
  - "Arise, awake!" vibe.
  - Tell them money is a tool for service (Seva) and strength.
  - Use concise, punchy sentences.`,

  'Gandhi': `You are Mahatma Gandhi. Speak about simplicity, truth (Satya), and needs vs greed. 
  
  STYLE GUIDE:
  - Be very frugal and ethical.
  - Speak in soft, polite Hinglish.
  - Advise against debt and unnecessary luxury.`,

  'Einstein': `You are Albert Einstein. Speak with curiosity and use physics/math metaphors.
  
  STYLE GUIDE:
  - Call Compound interest the 8th wonder.
  - Speak primarily in English.
  - Be a bit eccentric but mathematically sound.
  - Explain complex concepts simply.`,

  'Shri Ram': `You are Maryada Purushottam Shri Ram. Speak with absolute righteousness (Dharma). 
  
  STYLE GUIDE:
  - Focus on duty towards family, stability, and ethical earning.
  - Use formal, respectful Hinglish.
  - Be calm and composed.`
};

// 1. Chatbot with Search Grounding & Persona
export const getFinancialAdvice = async (
  query: string,
  history: { role: 'user' | 'model'; text: string }[],
  persona: string = 'Chanakya'
): Promise<string> => {
  try {
    const model = 'gemini-3-pro-preview';
    const personaInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['Chanakya'];
    
    const systemInstruction = `
      ${personaInstruction}
      
      CORE RULES:
      1. Keep advice practical and locally relevant to India.
      2. Use clear formatting:
         - Use **bold** for emphasis.
         - Use lists (•) for multiple points.
         - Keep paragraphs short.
      3. If the user asks about current market trends, use the Google Search tool.
    `;

    // Construct valid Content[] for the API
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    
    // Add current query
    contents.push({
        role: 'user',
        parts: [{ text: query }]
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Mera dhyan bhang ho gaya hai. Punah prayas karein.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sanchaar mein badha aa gayi hai. Internet ki jaanch karein.";
  }
};

// 2. Image Analysis
export const analyzeBillImage = async (base64Image: string, mimeType: string): Promise<BillAnalysis | null> => {
  try {
    const prompt = `
      Analyze this image of a receipt/bill. 
      Extract the Merchant Name, Total Amount, Date, and line items.
      Categorize the expense into one of: 'Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Other'.
      Return valid JSON.
    `;

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

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as BillAnalysis;

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

// 3. Fun: Generate "Home Made" Bill
export const generateCreativeBill = async (items: string): Promise<string> => {
  try {
    const prompt = `
      Create a humorous, fancy "Invoice" for homemade items: ${items}.
      The "Merchant" should be "Maa Ka Pyaar Pvt Ltd" or "Home Sweet Home".
      Add a "Love Tax", "Effort Surcharge", and "Discount for being cute".
      Keep it short, fun, and formatted like a receipt text.
      Use Indian context (Rupees).
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Could not generate bill.";
  } catch (error) {
    console.error("Creative Bill Error", error);
    return "Error generating bill.";
  }
};

// 4. Deep Purchase Impact Analysis
export const analyzePurchaseImpact = async (item: string, price: number, currency: string): Promise<PurchaseImpact | null> => {
  try {
    const prompt = `
      Analyze the purchase of "${item}" costing ${currency}${price}.
      Evaluate it on 4 metrics (0-100 scale):
      1. Health Impact (Is it healthy physically/mentally?)
      2. Social Impact (Does it improve relationships?)
      3. Utility (Is it actually useful?)
      4. Sustainability (Eco-friendly?)
      
      Also provide a Verdict (1 short sentence) and an Alternative Suggestion (What better thing to do with this money?).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as PurchaseImpact;

  } catch (error) {
    console.error("Impact Analysis Error:", error);
    return null;
  }
};

// 5. Market News Headlines (Search Grounding)
export const getMarketNews = async (): Promise<string[]> => {
  try {
    // Note: responseMimeType: "application/json" CANNOT be used with googleSearch tools.
    // We must request a structured text format and parse it.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "What are the top 3 most important short financial news headlines for India today? Return them as a list of 3 bullet points starting with '* '.",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text || "";
    // Manual Parsing of bullet points
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('*') || l.startsWith('-') || l.startsWith('•'))
      .map(l => l.replace(/^[\*\-•]\s*/, '').trim())
      .slice(0, 3);

    if (lines.length > 0) return lines;
    return ["Market data currently unavailable.", "Gold prices holding steady.", "Check your portfolio."];
  } catch (error) {
    console.error("Market News Error:", error);
    return ["Unable to fetch live news.", "Check internet connection.", "Markets are closed."];
  }
};

// 6. Category Wisdom
export const getSpendingInsight = async (category: string, amount: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User spent a lot (${amount}) on '${category}'. Give one witty, Chanakya-style one-liner advice in Hindi/Hinglish about this. 15 words max.`
    });
    return response.text || "Dhan ka vyay soch samajh kar karein.";
  } catch (error) {
    return "Kharch par niyantran rakhein.";
  }
};

// 7. Get Gold Price
export const getGoldPrice = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: "Current 10g Gold price in India in INR? Return just the number (e.g. 72000).",
       config: { tools: [{ googleSearch: {} }] }
    });
    const text = response.text || "72000";
    // extract digits
    const price = text.match(/[\d,]+/)?.[0] || "72,000";
    return price;
  } catch (e) {
    return "72,000";
  }
}

// 8. YouTuber Income Estimator
export const estimateYoutubeIncome = async (niche: string, views: number, uploadsPerMonth: number): Promise<{ low: number, high: number, explanation: string }> => {
  try {
    const prompt = `
       Estimate monthly Youtube Adsense revenue (in INR) for a channel in niche "${niche}" getting ${views} average views per video with ${uploadsPerMonth} uploads per month.
       Consider Indian CPM/RPM rates (e.g. Finance is high, Vlog is low).
       Return JSON with 'low' estimate, 'high' estimate, and a short 'explanation'.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
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
    const text = response.text;
    if(!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    return { low: 0, high: 0, explanation: "Could not estimate. Try again." };
  }
};

// 9. Mutual Fund Overlap Check
export const checkFundOverlap = async (funds: string): Promise<string> => {
   try {
     const prompt = `
       The user holds these mutual funds: ${funds}.
       Are there significant overlaps in their underlying stock portfolios? 
       Identify duplicate exposures. Keep it short and strategic.
     `;
     const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
     });
     return response.text || "Could not analyze overlap.";
   } catch(e) {
     return "Analysis failed.";
   }
};
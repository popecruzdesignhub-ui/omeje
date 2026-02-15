import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { Asset, GlobalAccount } from "../types";
import { getGlobalAccounts } from "./dataService";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Market Insight ---
export const getMarketInsight = async (asset: Asset): Promise<string> => {
  if (!ai) {
    return "AI-powered market insights are currently disabled. To unlock real-time analysis, please configure the API_KEY environment variable.";
  }

  try {
    const prompt = `
      Act as a senior financial analyst. Provide a brief, professional market insight (max 3 sentences) for ${asset.name} (${asset.symbol}).
      
      Current Price: $${asset.price.toLocaleString()}
      24h Change: ${asset.change24h.toFixed(2)}%
      Market Cap: ${asset.marketCap}
      
      Base your sentiment on the price movement direction (positive or negative). 
      Be concise, objective, and use financial terminology. Do not give financial advice.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insight at this time. Please check your network connection or API quota.";
  }
};

// --- Chat Support Tools ---

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "changeLanguage",
        description: "Change the application language preference.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            language: {
              type: Type.STRING,
              description: "The language code to switch to. Supported: 'en' (English), 'es' (Spanish), 'fr' (French).",
              enum: ["en", "es", "fr"]
            }
          },
          required: ["language"]
        }
      },
      {
        name: "getBankAccounts",
        description: "Retrieve the list of active international bank accounts for wire transfer deposits.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            region: {
              type: Type.STRING,
              description: "Optional region to filter accounts by (e.g., 'US', 'Europe')"
            }
          },
        }
      },
      {
        name: "getExchangeRate",
        description: "Get the current exchange rate between two currencies.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                from: { type: Type.STRING, description: "Base currency code (e.g. USD)" },
                to: { type: Type.STRING, description: "Target currency code (e.g. JPY)" }
            },
            required: ["from", "to"]
        }
      }
    ]
  }
];

export const createSupportChat = () => {
  if (!ai) return null;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash', // Switched to 2.5-flash for better stability with tools
    config: {
      temperature: 0.7,
      systemInstruction: "You are the AI Support Agent for Psychology Trade, a premium fintech app. \n" +
        "1. Be helpful, professional, and concise.\n" +
        "2. If a user asks to change language, use the `changeLanguage` tool.\n" +
        "3. If a user asks about wire transfers, deposits, or bank details, use `getBankAccounts`.\n" +
        "4. For currency conversion queries (e.g. 'USD to JPY'), use the `getExchangeRate` tool.\n" +
        "5. If you cannot help, advise them to wait for a human admin.",
      tools: tools
    }
  });
};

export const executeToolCall = async (
  name: string, 
  args: any, 
  setLang: (l: any) => void
): Promise<any> => {
  console.log(`[AI TOOL] Executing ${name} with args:`, args);

  switch (name) {
    case 'changeLanguage':
      if (args.language) {
        setLang(args.language);
        return { result: `Language successfully changed to ${args.language}.` };
      }
      return { error: "Language code missing." };
      
    case 'getBankAccounts':
      const accounts = getGlobalAccounts();
      // Format purely for the model to read and summarize
      const filtered = args.region 
        ? accounts.filter(a => a.country.toLowerCase().includes(args.region.toLowerCase()))
        : accounts;

      return { 
        accounts: filtered.map(a => ({
           bank: a.bankName,
           country: a.country,
           currency: a.currency,
           details: `Account: ${a.accountNumber}, Swift: ${a.swift}`
        }))
      };

    case 'getExchangeRate':
       // Mock exchange rates logic
       const from = args.from?.toUpperCase();
       const to = args.to?.toUpperCase();
       let rate = 1.0;
       
       if (from === 'USD' && to === 'JPY') rate = 150.25;
       else if (from === 'USD' && to === 'EUR') rate = 0.92;
       else if (from === 'USD' && to === 'GBP') rate = 0.79;
       else if (from === 'EUR' && to === 'USD') rate = 1.09;
       else rate = 1.0; // Fallback

       return {
          from,
          to,
          rate,
          amount: 1,
          converted: 1 * rate,
          timestamp: new Date().toISOString()
       };
      
    default:
      return { error: "Unknown tool." };
  }
};
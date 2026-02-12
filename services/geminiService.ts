import { GoogleGenAI } from "@google/genai";
import { Asset } from "../types";

// Initialize Gemini Client
// We assume the API key is available in the environment as per instructions.
// If not, we handle errors gracefully in the UI.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getMarketInsight = async (asset: Asset): Promise<string> => {
  if (!ai) {
    return "AI-powered market insights are currently disabled. To unlock real-time analysis, please configure the API_KEY environment variable with a valid Google Gemini API key.";
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
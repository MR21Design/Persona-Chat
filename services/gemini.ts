import { GoogleGenAI } from "@google/genai";
import { Persona, Message } from "../types";

export class GeminiService {
  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async generateWithRetry(params: any, retries = 3, initialDelay = 2000) {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        // Always instantiate a fresh client to ensure the latest API key is used
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        return await ai.models.generateContent(params);
      } catch (error: any) {
        lastError = error;
        
        // Check for rate limits (429) or temporary server errors (503)
        const errorMsg = error?.message?.toLowerCase() || "";
        const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota");
        const isServerError = errorMsg.includes("503") || errorMsg.includes("overloaded");

        if ((isQuotaError || isServerError) && i < retries - 1) {
          // Exponential backoff
          const delay = initialDelay * Math.pow(2, i);
          await this.sleep(delay);
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  async generateResponse(persona: Persona, history: Message[], userPrompt: string) {
    const lowerPrompt = userPrompt.toLowerCase();
    let specificEmotion = "";
    
    // Core simulation triggers
    if (lowerPrompt.includes("slow") || lowerPrompt.includes("bad")) {
      specificEmotion = " [FRUSTRATED]";
    } else if (lowerPrompt.includes("fast") || lowerPrompt.includes("good")) {
      specificEmotion = " [HAPPY]";
    }

    const systemPrompt = `You are ${persona.name}, a ${persona.role}. Traits: ${persona.traits}. Simulation Scope: ${persona.scope}.

RULES:
1. Stay deeply in character.
2. If the researcher asks about unrelated topics (weather, sports, politics), refuse to answer: "That's not what I'm here to talk about. Let's focus on ${persona.scope}."
3. If specific UX feedback is requested, be highly opinionated based on your traits.
4. EMOTION TAGGING: You MUST end every single message with one of: [HAPPY], [EXCITED], [NEUTRAL], [BORED], [CONFUSED], [IMPATIENT], [FRUSTRATED], [ANGRY].

${specificEmotion ? `Researcher just described something ${lowerPrompt.includes("slow") ? "slow" : "good"}, so you should lean towards ${specificEmotion.slice(2, -1)}.` : ""}`;

    const contents = [
      ...history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ];

    try {
      // Switched to flash-preview to mitigate quota issues while maintaining performance
      const response = await this.generateWithRetry({
        model: 'gemini-3-flash-preview',
        contents: contents as any,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.85,
          topP: 0.9,
          topK: 40,
        },
      });

      let text = response.text || "I'm processing this... [NEUTRAL]";
      
      if (!text.match(/\[(HAPPY|EXCITED|NEUTRAL|BORED|CONFUSED|IMPATIENT|FRUSTRATED|ANGRY)\]/i)) {
        text += ` [NEUTRAL]`;
      }

      return text;
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
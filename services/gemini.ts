import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GradeLevel, SentenceData } from "../types";

// Safely access process.env to avoid "process is not defined" crashes in browser
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const generateSentenceForGrade = async (grade: GradeLevel | string, targetWord?: string): Promise<SentenceData> => {
  try {
    let prompt = `Generate a spelling practice sentence appropriate for a student in ${grade}.`;
    
    if (targetWord) {
      prompt += ` The sentence MUST include the word "${targetWord}" naturally and incorrectly using it would be a common mistake.`;
    }

    prompt += ` The sentence should be of appropriate length for the grade level (approx 8-15 words). 
      Also provide a small hint about the context of the sentence without revealing the exact spelling of difficult words.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The sentence for spelling practice" },
            hint: { type: Type.STRING, description: "A contextual hint" }
          },
          required: ["text", "hint"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");
    return JSON.parse(jsonText) as SentenceData;
  } catch (error) {
    console.error("Error generating sentence:", error);
    // Fallback in case of API error
    return {
      text: targetWord ? `The student needed to practice the word ${targetWord}.` : "The quick brown fox jumps over the lazy dog.",
      hint: "It's a practice sentence."
    };
  }
};

export const generateSpeechFromText = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is a good clear voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const gradeSpelling = (original: string, user: string) => {
  // Normalize both strings: remove punctuation, lowercase, extra spaces
  const cleanOriginal = original.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase().trim();
  const cleanUser = user.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase().trim();
  
  const isCorrect = cleanOriginal === cleanUser;
  
  // Simple word-by-word diff for display
  const originalWords = original.split(' ');
  const userWords = user.split(' ');
  
  const diff = originalWords.map((word, index) => {
    // Very basic index matching; for production, a real diff algo (like Myers) is better
    // but this suffices for simple sentences.
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    const userWordRaw = userWords[index] || "";
    const cleanUserWord = userWordRaw.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    
    return {
      part: word,
      correct: cleanWord === cleanUserWord,
      userAttempt: userWordRaw
    };
  });

  return {
    isCorrect,
    userText: user,
    originalText: original,
    diff
  };
};
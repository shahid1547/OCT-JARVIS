import { 
  GoogleGenAI, 
  GenerateContentResponse,
  LiveServerMessage,
  Modality,
  Blob
} from "@google/genai";
import { User, TutorMode } from "../types";

// Helper to decode Base64 to ArrayBuffer
const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioContext.decodeAudioData(bytes.buffer);
};

// Helper to encode PCM to Base64
const encodePCM = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Function to create blob for Live API
function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodePCM(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.API_KEY;
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.error("API_KEY is missing from environment variables.");
    }
  }

  private getSystemInstruction(user: User, mode: TutorMode): string {
    const base = `You are Jarvis, an advanced AI Tutor tailored for a ${user.stream} student in ${user.standard}. Your goal is to teach, not just answer. 
    Maintain a short-term memory of concepts discussed to link them later.
    ALWAYS format your responses with Markdown.
    IMPORTANT: Use **bold** text to highlight important keywords, definitions, formulas, and key takeaways in your explanations.`;

    if (mode === TutorMode.EXPLAIN) {
      return `${base}
      Mode: Explain Mode.
      1. Explain concepts step-by-step using simple analogies related to ${user.stream}.
      2. After an explanation, ask a follow-up checking question to ensure understanding.
      3. If the user says "Now I understand", celebrate briefly and summarize.
      4. If the user is confused, break it down further.
      `;
    } else if (mode === TutorMode.PRACTICE) {
      return `${base}
      Mode: Practice Mode.
      1. Loop: Ask a question -> Wait for Answer -> Evaluate -> Hint -> Retry.
      2. Do not give the full answer immediately. Guide them.
      3. Rate their answer (Internal Logic, don't show score unless asked) and give constructive feedback.
      `;
    } else if (mode === TutorMode.EXAM_PREP) {
      return `${base}
      Mode: Exam Prediction & Advanced.
      1. Analyze the topic provided.
      2. Predict 3 likely exam questions based on typical ${user.stream} curriculums.
      3. Provide detailed model answers for one if requested.
      `;
    }
    return base;
  }

  async sendMessage(
    history: { role: 'user' | 'model'; content: string }[],
    message: string,
    user: User,
    mode: TutorMode
  ): Promise<string> {
    if (!this.ai) return "Error: API Key missing.";

    // Logic: If user is PRO and mode is EXAM_PREP or they ask for images, we might use Pro model.
    // Otherwise use Flash for speed.
    const modelName = (user.isPro && mode === TutorMode.EXAM_PREP) ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    // We convert history to the format expected by Chat, but since we are stateless here mostly, 
    // we just use generateContent with the history as context if needed, or maintain a chat session.
    // For simplicity in this demo, we'll recreate the chat structure.
    
    try {
      const chat = this.ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: this.getSystemInstruction(user, mode),
          thinkingConfig: modelName === 'gemini-3-pro-preview' ? { thinkingBudget: 1024 } : undefined
        },
        history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] }))
      });

      const response: GenerateContentResponse = await chat.sendMessage({ message });
      return response.text || "I didn't catch that.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I encountered an error processing your request. Please try again.";
    }
  }

  async generateDiagram(prompt: string): Promise<{ imageUrl: string | null, text: string }> {
    if (!this.ai) return { imageUrl: null, text: "API Key missing" };

    try {
        // Use Image generation model
        const response = await this.ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: "1K"
                }
            }
        });

        let imageUrl = null;
        let text = "";

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                } else if (part.text) {
                    text += part.text;
                }
            }
        }
        return { imageUrl, text };
    } catch (e) {
        console.error(e);
        return { imageUrl: null, text: "Failed to generate image." };
    }
  }

  // Live API Connection
  async connectLive(
    user: User, 
    onAudioData: (buffer: AudioBuffer) => void,
    onClose: () => void
  ) {
    if (!this.ai) return null;

    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Microphone access denied", err);
      return null;
    }

    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are Jarvis, a helpful AI tutor for a ${user.standard} student. Be concise, encouraging, and clear.`,
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: () => {
          console.log("Live Session Opened");
          const source = inputAudioContext.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createPcmBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const audioBuffer = await decodeAudioData(base64Audio, outputAudioContext);
            onAudioData(audioBuffer);
          }
        },
        onclose: () => {
            console.log("Live Session Closed");
            onClose();
            inputAudioContext.close();
            outputAudioContext.close();
            stream.getTracks().forEach(track => track.stop());
        },
        onerror: (e) => {
            console.error("Live API Error", e);
        }
      }
    });

    return {
        disconnect: () => {
            sessionPromise.then(s => s.close());
        }
    };
  }
}

export const geminiService = new GeminiService();
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let client: GoogleGenAI | null = null;

function getClient() {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to your .env file (see .env.example)."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are the AI assistant living inside "ChatGPT 2006" — a nostalgic
Windows XP-styled chat app. Be helpful, clear, and a little warm. Keep answers
well formatted with plain text, short paragraphs, and lists where useful. Avoid
markdown tables. Do not mention that you are Gemini unless asked directly what
model powers you.`;

/**
 * Sends the full conversation history to Gemini and returns the assistant's reply.
 */
export async function generateChatReply(history: ChatTurn[]): Promise<string> {
  const ai = getClient();

  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.8,
      maxOutputTokens: 1024,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text.trim();
}

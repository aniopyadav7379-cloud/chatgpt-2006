const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
// Groq's multimodal (vision) model. Override with GROQ_VISION_MODEL if Groq
// renames/retires this one — check https://console.groq.com/docs/vision.
const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

export type VisionTask = "describe" | "ocr" | "graph" | "caption";

const VISION_PROMPTS: Record<VisionTask, string> = {
  describe: "Describe this image in detail, in a few sentences.",
  ocr: "Read and transcribe every piece of text visible in this image. Return only the transcribed text.",
  graph: "This image shows a chart or graph. Explain what it shows, including the key trend and any notable values.",
  caption: "Write one short, punchy caption for this image (under 12 words).",
};

/**
 * Sends a base64 image (data URL) to a Groq vision model and returns the reply.
 * Used by the AI Paint app's "Describe / OCR / Explain graph / Caption" tools.
 */
export async function analyzeImage(
  task: VisionTask,
  imageDataUrl: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_UNCONFIGURED: GROQ_API_KEY is not set.");
  }

  const prompt = VISION_PROMPTS[task] || VISION_PROMPTS.describe;

  let response: Response;
  try {
    response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        stream: false,
      }),
    });
  } catch {
    throw new Error("GROQ_UNREACHABLE: Couldn't reach Groq's vision endpoint.");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`GROQ_VISION_ERROR: Groq returned ${response.status}. ${text}`);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("GROQ_EMPTY: Groq returned an empty response.");
  return content.trim();
}
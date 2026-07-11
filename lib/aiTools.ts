import { generateChatReply } from "@/lib/groq";

export type AiTask =
  | "rewrite"
  | "grammar"
  | "summarize"
  | "translate"
  | "explain"
  | "email"
  | "resume"
  | "coverletter"
  | "reply"
  | "search-answer";

const TASK_PROMPTS: Record<AiTask, (input: string, extra?: string) => string> = {
  rewrite: (input) =>
    `Rewrite the following text to be clearer and better written. Keep the original meaning and length roughly the same. Return only the rewritten text, no preamble.\n\n${input}`,
  grammar: (input) =>
    `Fix all grammar, spelling, and punctuation mistakes in the following text. Return only the corrected text, no preamble.\n\n${input}`,
  summarize: (input) =>
    `Summarize the following text in a few clear bullet points.\n\n${input}`,
  translate: (input, extra) =>
    `Translate the following text into ${extra || "Spanish"}. Return only the translation.\n\n${input}`,
  explain: (input) =>
    `Explain the following text or concept simply, as if to a curious beginner.\n\n${input}`,
  email: (input) =>
    `Write a clear, professional email based on this request:\n\n${input}`,
  resume: (input) =>
    `Write a professional resume bullet-point section based on this background/request. Use strong action verbs.\n\n${input}`,
  coverletter: (input) =>
    `Write a concise, professional cover letter based on this request:\n\n${input}`,
  reply: (input) =>
    `Write a polite, appropriate reply to the following message:\n\n${input}`,
  "search-answer": (input) =>
    `Answer this question directly and concisely, like a search-engine featured snippet (2-4 sentences max):\n\n${input}`,
};

/**
 * Runs a single-shot AI task (used by Notepad, Outlook, Internet Explorer, and
 * the File Analyzer apps). Wraps the existing generateChatReply from lib/groq.ts
 * so there's only one place that talks to the Groq API.
 */
export async function runAiTask(
  task: AiTask,
  input: string,
  extra?: string
): Promise<string> {
  const builder = TASK_PROMPTS[task];
  if (!builder) throw new Error(`Unknown AI task: ${task}`);
  const prompt = builder(input, extra);
  return generateChatReply([{ role: "user", content: prompt }]);
}
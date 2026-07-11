import { HelpCircle, Info, Keyboard, MessageCircleQuestion } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Window from "@/components/Window";

const FAQS = [
  {
    q: "What is this?",
    a: "AI Knowledge Engine 2006 is an AI chat app with a Windows XP-era look and modern engineering underneath. Ask it anything, the same way you'd use any AI assistant.",
  },
  {
    q: "Is my chat history saved?",
    a: "Yes. Every conversation is saved locally to the app's database so you can revisit it from the History page anytime.",
  },
  {
    q: "Do I need an account?",
    a: "No login is required for this build. Just open the app and start chatting.",
  },
  {
    q: "What powers the AI?",
    a: "Responses come from the Google Gemini API, connected through a Next.js API route on the server.",
  },
  {
    q: "How do I clear a conversation?",
    a: "Open a conversation and click Clear in its title bar, or clear everything at once from the History page.",
  },
];

export default function HelpPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-4">
        <Window
          title="Help and About"
          icon={<HelpCircle size={14} />}
          bodyClassName="p-6 space-y-6"
        >
          <section className="flex gap-3">
            <Info size={18} className="text-sky-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-[14px] font-semibold text-white">
                About this app
              </h2>
              <p className="text-[12.5px] text-slate-300 mt-1 leading-relaxed">
                AI Knowledge Engine 2006 pairs an early-2000s desktop
                aesthetic — glossy blue windows, dial-up loading screens,
                MSN-style chat bubbles — with a genuinely current stack:
                Next.js 15, React 19, and the Gemini API.
              </p>
            </div>
          </section>

          <section className="flex gap-3">
            <Keyboard size={18} className="text-sky-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-[14px] font-semibold text-white">
                Keyboard shortcuts
              </h2>
              <ul className="text-[12.5px] text-slate-300 mt-1 space-y-1">
                <li>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[11px]">
                    Enter
                  </kbd>{" "}
                  — send a message
                </li>
                <li>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[11px]">
                    Shift + Enter
                  </kbd>{" "}
                  — new line
                </li>
              </ul>
            </div>
          </section>

          <section className="flex gap-3">
            <MessageCircleQuestion
              size={18}
              className="text-sky-300 shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold text-white mb-2">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {FAQS.map((f) => (
                  <div
                    key={f.q}
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5"
                  >
                    <p className="text-[12.5px] font-semibold text-slate-100">
                      {f.q}
                    </p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Window>
      </div>
    </main>
  );
}

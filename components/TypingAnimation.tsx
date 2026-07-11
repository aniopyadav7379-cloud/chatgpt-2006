"use client";

import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps {
  text: string;
  speedMs?: number;
  onDone?: () => void;
}

/** Reveals `text` character by character, MSN-Messenger-quiz style. */
export default function TypingAnimation({
  text,
  speedMs = 14,
  onDone,
}: TypingAnimationProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setVisibleChars(0);
  }, [text]);

  useEffect(() => {
    if (visibleChars >= text.length) {
      onDoneRef.current?.();
      return;
    }
    const t = setTimeout(() => setVisibleChars((c) => c + 1), speedMs);
    return () => clearTimeout(t);
  }, [visibleChars, text, speedMs]);

  const done = visibleChars >= text.length;

  return (
    <span className="whitespace-pre-wrap break-words">
      {text.slice(0, visibleChars)}
      {!done && <span className="caret" aria-hidden />}
    </span>
  );
}

export function TypingIndicatorDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="AI is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-sky-300/80 animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

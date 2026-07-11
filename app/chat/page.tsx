"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const [refreshKey, setRefreshKey] = useState(0);

  const selectConversation = useCallback(
    (id: string) => {
      router.push(`/chat?c=${id}`);
    },
    [router]
  );

  const startNewChat = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleConversationCreated = useCallback(
    (id: string) => {
      router.replace(`/chat?c=${id}`);
      setRefreshKey((k) => k + 1);
    },
    [router]
  );

  const handleCleared = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 flex gap-4 min-h-0">
        <Sidebar
          activeId={conversationId}
          onSelect={selectConversation}
          onNewChat={startNewChat}
          refreshKey={refreshKey}
        />
        <div className="flex-1 flex flex-col min-h-[70vh] max-h-[calc(100vh-7.5rem)]">
          <ChatBox
            key={conversationId ?? "new"}
            conversationId={conversationId}
            onConversationCreated={handleConversationCreated}
            onCleared={handleCleared}
          />
        </div>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

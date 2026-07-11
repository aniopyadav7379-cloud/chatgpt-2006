import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatGPT 2006 — Windows XP AI",
  description:
    "A Windows XP–styled AI chat experience. 2006 nostalgia, 2026 engineering.",
  icons: {
    icon: "/icons/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-xp antialiased text-slate-100 bg-xp-bgstart">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              color: "#E2E8F0",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              fontFamily: "Tahoma, Verdana, sans-serif",
              fontSize: "13px",
              backdropFilter: "blur(8px)",
            },
          }}
        />
      </body>
    </html>
  );
}
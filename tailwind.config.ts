import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        xp: {
          primary: "#2563EB",
          secondary: "#60A5FA",
          accent: "#38BDF8",
          bgstart: "#0F172A",
          bgend: "#2563EB",
          glass: "rgba(255,255,255,0.15)",
          border: "rgba(255,255,255,0.3)",
          taskbar: "#0B1739",
          titlebarstart: "#1E56D6",
          titlebarend: "#3B82F6",
        },
      },
      fontFamily: {
        xp: ["Tahoma", "Verdana", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "xp-gradient": "linear-gradient(160deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%)",
        "titlebar-gradient": "linear-gradient(180deg, #3B82F6 0%, #1E56D6 55%, #1544AD 100%)",
        "glass-sheen": "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        xpwindow: "0 20px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.15) inset",
        xpbutton: "0 1px 0 rgba(255,255,255,0.4) inset, 0 -2px 4px rgba(0,0,0,0.25) inset",
        glow: "0 0 24px rgba(56,189,248,0.45)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" },
        },
        "aurora-drift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "dial-progress": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-slow": "float 14s ease-in-out infinite",
        aurora: "aurora-drift 18s ease infinite",
        blink: "blink 1s step-end infinite",
        "dial-progress": "dial-progress 2.4s ease-in-out forwards",
        "pop-in": "pop-in 0.25s ease-out",
      },
      borderRadius: {
        xpwin: "10px",
      },
    },
  },
  plugins: [],
};
export default config;

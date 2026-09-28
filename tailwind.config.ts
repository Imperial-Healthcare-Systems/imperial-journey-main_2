import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0d0d0d", soft: "#1a1a1a" },
        muted: "#7a7a7a",
        line: "#ececec",
        paper: "#ffffff",
        offwhite: "#fafafa",
        accent: { DEFAULT: "#c8a45a", deep: "#a08039", soft: "#e8d6a8" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        wrap: "1280px",
        narrow: "900px",
      },
      keyframes: {
        drop: {
          "0%, 100%": { transform: "scaleY(1)", transformOrigin: "top" },
          "50%": { transform: "scaleY(0.4)", transformOrigin: "top" },
        },
        ripple: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
        modalIn: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drop: "drop 2s ease-in-out infinite",
        ripple: "ripple 2s ease-out infinite",
        pulseDot: "pulseDot 1.5s ease-in-out infinite",
        modalIn: "modalIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

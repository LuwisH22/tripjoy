import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#D7B35B", // mustard
          pink: "#DFA4AF", // dusty pink
          coral: "#E89A87", // warm coral
          sky: "#7CB7E8", // sky blue
          mint: "#93B29B", // sage green
          soft: "#DCEBF5", // cloud
          flight: "#A9CDEB", // flight path
          stamp: "#A8B7A0", // passport stamp
          cream: "#F6F1E7", // background
          card2: "#FCFAF7", // card secondary
        },
        ink: "#2E2E2E",
        muted: "#7C7C7C",
        faint: "#A8A8A8",
        line: "#E8E1D4",
        success: "#5E9B6E",
        warning: "#C9A24A",
        danger: "#D9694F",
      },
      fontFamily: {
        heading: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        body: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(45,45,45,0.18)",
        float: "0 18px 50px -18px rgba(45,45,45,0.25)",
        glow: "0 0 0 4px rgba(110,198,255,0.15)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
        wiggle: "wiggle 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

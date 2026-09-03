/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#0a0d14",
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "#111622",
          foreground: "#f9fafb",
        },
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1f293d",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#1e293b",
          foreground: "#f3f4f6",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-green": "glowGreen 2s infinite alternate",
        "glow-red": "glowRed 2s infinite alternate",
      },
      keyframes: {
        glowGreen: {
          "0%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)" },
        },
        glowRed: {
          "0%": { boxShadow: "0 0 5px rgba(239, 68, 68, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

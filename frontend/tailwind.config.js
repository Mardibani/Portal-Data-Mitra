/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: "#1e40af", fg: "#ffffff" },
        surface: "#ffffff",
        raised: "#ffffff",
        inset: "#f3f4f6",
        border: "#e5e7eb",
        primary: "#111827",
        secondary: "#6b7280",
        tertiary: "#9ca3af",
      },
    },
  },
  plugins: [],
};
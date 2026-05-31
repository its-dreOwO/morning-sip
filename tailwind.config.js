/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-deep": "var(--bg-deep)",
        "bg-raised": "var(--bg-raised)",
        card: "var(--card-surface)",
        "text-bright": "var(--text-bright)",
        "text-muted": "var(--text-muted)",
        "accent-amber": "#ffc879",
        "accent-teal": "#5fe0c8",
        "accent-coral": "#ff8f7a",
        "accent-violet": "#c2a6ff",
        "accent-green": "#a6e081",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0C4A6E',
        secondary: '#16A34A', 
        accent: '#1EB2A6',
        warm: '#F59E0B',
        neutral: '#64748B',
        light: '#F8FAFC',
        success: '#10B981',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};

export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Modern dark theme - no purple
        dark: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#111118',
            tertiary: '#1a1a24',
            card: '#1f1f2e',
            hover: '#252535',
          },
          border: {
            DEFAULT: '#2a2a3a',
            light: '#3a3a4a',
            accent: '#14b8a6',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            muted: '#94a3b8',
            accent: '#14b8a6',
          },
          accent: {
            primary: '#14b8a6', // Teal
            secondary: '#06b6d4', // Cyan
            success: '#10b981', // Emerald
            warning: '#f59e0b', // Amber
            danger: '#ef4444', // Red
            info: '#3b82f6', // Blue
          },
        },
      },
    },
  },
  plugins: [],
}


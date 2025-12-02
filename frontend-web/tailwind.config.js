/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vibrant Purple/Blue/Pink Gradient Theme
        glass: {
          bg: {
            primary: '#0a0a15',
            secondary: '#1a0f2e',
            tertiary: '#1e1a3a',
            card: 'rgba(139, 92, 246, 0.08)',
            hover: 'rgba(139, 92, 246, 0.15)',
            light: 'rgba(139, 92, 246, 0.12)',
            dark: 'rgba(0, 0, 0, 0.3)',
          },
          border: {
            DEFAULT: 'rgba(139, 92, 246, 0.2)',
            light: 'rgba(168, 85, 247, 0.3)',
            accent: 'rgba(236, 72, 153, 0.4)',
            glow: 'rgba(139, 92, 246, 0.5)',
          },
          text: {
            primary: '#ffffff',
            secondary: '#e9d5ff',
            muted: '#c084fc',
            accent: '#ec4899',
            glow: '#f0abfc',
          },
          accent: {
            primary: '#a855f7', // Vibrant Purple
            secondary: '#ec4899', // Pink
            tertiary: '#3b82f6', // Blue
            quaternary: '#8b5cf6', // Violet
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4',
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a15 0%, #1a0f2e 50%, #1e1a3a 100%)',
        'gradient-radial': 'radial-gradient(circle at top, rgba(139, 92, 246, 0.2), transparent)',
      },
      backdropBlur: {
        xs: '2px',
        'glass': '20px',
        'glass-lg': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-xl': '0 20px 60px 0 rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.6)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.6)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.6)',
        'glow-multi': '0 0 40px rgba(168, 85, 247, 0.4), 0 0 80px rgba(236, 72, 153, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(236, 72, 153, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}

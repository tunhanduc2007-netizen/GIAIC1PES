/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ucl: {
          dark: '#020617',
          blue: '#001C58',
          star: '#005CB9',
          neon: '#00F2FF',
          silver: '#D1D5DB',
        },
        gaming: {
          pink: '#FF00FF',
          cyan: '#00FFFF',
          yellow: '#FFFF00',
        }
      },
      backgroundImage: {
        'ucl-gradient': 'linear-gradient(135deg, #020617 0%, #001C58 50%, #005CB9 100%)',
        'neon-glow': 'radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}

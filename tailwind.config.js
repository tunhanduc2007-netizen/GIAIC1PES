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
          dark: '#0a0b0d',    /* FWC Deep Dark */
          blue: '#d4af37',    /* Trophy Gold */
          star: '#e9c46a',    /* Warm Gold */
          neon: '#ff2a5f',    /* Neon Magenta */
          silver: '#a3a3c2',  /* Sporty Silver */
        },
        gaming: {
          pink: '#ff2a5f',
          cyan: '#d4af37',
          yellow: '#e9c46a',
        }
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      backgroundImage: {
        'ucl-gradient': 'linear-gradient(135deg, #0a0b0d 0%, #1e111a 50%, #381223 100%)',
        'neon-glow': 'radial-gradient(circle, rgba(255, 42, 95, 0.15) 0%, transparent 70%)',
        'gold-glow': 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
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

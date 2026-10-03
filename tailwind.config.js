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
          dark: '#030814',      /* Midnight Pitch Black */
          navy: '#051632',      /* Official UCL Midnight Blue */
          blue: '#0084ff',      /* Electric Starball Blue */
          cyan: '#00f2ff',      /* Glowing Cyan */
          gold: '#ffd700',      /* Trophy Pure Gold */
          star: '#ffea79',      /* Star Radiance */
          neon: '#ff2a5f',      /* High-energy Accent (Thịnh) */
          silver: '#b8c9dc',    /* Broadcast Silver */
        },
        gaming: {
          pink: '#ff2a5f',
          cyan: '#00f2ff',
          yellow: '#ffd700',
        }
      },
      fontFamily: {
        bebas: ['"Oswald"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      backgroundImage: {
        'ucl-gradient': 'linear-gradient(135deg, #030814 0%, #061938 50%, #0a2a5e 100%)',
        'ucl-card': 'linear-gradient(180deg, rgba(6, 25, 56, 0.75) 0%, rgba(3, 11, 25, 0.85) 100%)',
        'neon-glow': 'radial-gradient(circle, rgba(0, 242, 255, 0.25) 0%, transparent 70%)',
        'gold-glow': 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
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

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#0f0f1a',
          card: '#12121f',
          elevated: '#1a1a2e',
        },
        accent: {
          blue: '#4f8ef7',
          purple: '#8b5cf6',
          cyan: '#22d3ee',
          pink: '#f472b6',
          green: '#34d399',
          amber: '#fbbf24',
        },
        border: {
          subtle: '#1e1e3a',
          DEFAULT: '#2a2a4a',
          bright: '#4a4a7a',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(79, 142, 247, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(79, 142, 247, 0.8), 0 0 50px rgba(139, 92, 246, 0.3)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

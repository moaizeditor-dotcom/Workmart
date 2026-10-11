/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          950: '#04060A',
          900: '#080C14',
          850: '#0D1322',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
        },
        brand: {
          cyan: '#06B6D4',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'aurora': 'aurora 60s linear infinite',
        'light-sweep': 'lightSweep 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(6, 182, 212, 0.6)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        aurora: {
          'from': {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          'to': {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
        lightSweep: {
          '0%, 100%': { opacity: '0.3', transform: 'rotate(-45deg) translateY(-100%)' },
          '50%': { opacity: '0.8', transform: 'rotate(-45deg) translateY(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hologram': 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
      }
    },
  },
  plugins: [],
}

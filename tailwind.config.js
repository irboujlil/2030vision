/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1f2937',
          light: '#475569',
          dark: '#0f172a',
          card: '#e2e8f0',
          deep: '#111827'
        },
        gold: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1d4ed8'
        },
        cyan: {
          DEFAULT: '#0ea5e9',
          dim: '#0369a1'
        },
        silver: '#334155'
      },
      fontFamily: {
        display: ['"Avenir Next"', '"Segoe UI Variable"', '"Segoe UI"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SFMono-Regular"', 'ui-monospace', 'monospace']
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'glow-pulse':'glowPulse 2.5s ease-in-out infinite',
        'scan':      'scan 2.8s ease-in-out infinite',
        'number-up': 'numberUp 0.6s cubic-bezier(0.16,1,0.3,1)',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
        'shimmer':   'shimmer 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                           to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:  { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        glowPulse:{ '0%,100%': { boxShadow: '0 0 6px rgba(201,168,76,0.2)' }, '50%': { boxShadow: '0 0 20px rgba(201,168,76,0.5)' } },
        scan:     { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(500%)' } },
        numberUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        borderGlow: { '0%,100%': { borderColor: 'rgba(201,168,76,0.15)' }, '50%': { borderColor: 'rgba(201,168,76,0.35)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(201,168,76,0.18)',
        'gold-md': '0 0 24px rgba(201,168,76,0.28)',
        'cyan-sm': '0 0 10px rgba(56,189,248,0.12)',
        'cyan-md': '0 0 20px rgba(56,189,248,0.2)',
        'red-glow': '0 0 20px rgba(239,68,68,0.25)'
      }
    }
  },
  plugins: []
};

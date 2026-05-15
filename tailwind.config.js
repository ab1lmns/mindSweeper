/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        glass: 'rgb(var(--glass) / <alpha-value>)',
        glassborder: 'rgb(var(--border) / <alpha-value>)',
        surface: '#111118',
        card:    '#18181f',
        border:  '#252530',
        accent:  '#ff3d5a',
        safe:    '#39d98a',
        warn:    '#ffb800',
        primary: '#5865f2',
        muted:   '#a0a0c0', // Lighter purple-ish gray for dashboard style
        'liberty-red': '#f95f5f', // The specific red from the "Wins" card
        'liberty-purple': '#5c45a8', // Deep purple from the "Losses" card
        'liberty-blue': '#2972f5', // The vibrant blue
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body:    ['"Outfit"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'reveal':    'reveal 0.12s ease-out',
        'explode':   'explode 0.35s ease-out',
        'flag-in':   'flagIn 0.18s ease-out',
        'pulse-glow':'pulseGlow 2s ease-in-out infinite',
        'slide-up':  'slideUp 0.3s ease-out',
        'fade-in':   'fadeIn 0.4s ease-out',
      },
      keyframes: {
        reveal:    { from: { transform: 'scale(0.75)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        explode:   { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.4)' }, '100%': { transform: 'scale(1)' } },
        flagIn:    { from: { transform: 'scale(0) rotate(-30deg)' }, to: { transform: 'scale(1) rotate(0deg)' } },
        pulseGlow: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
}

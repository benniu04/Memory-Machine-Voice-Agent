/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass-dark': 'rgba(0, 0, 0, 0.7)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 0.8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'typewriter': 'typewriter 2s steps(20) forwards',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px) scale(0.8)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translateX(-100px) scale(0.9)' },
          'to': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(100px) scale(0.9)' },
          'to': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        fadeInScale: {
          'from': { opacity: '0', transform: 'scale(1.1)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 4px 16px rgba(245, 87, 108, 0.3)' },
          '50%': { boxShadow: '0 4px 24px rgba(245, 87, 108, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}


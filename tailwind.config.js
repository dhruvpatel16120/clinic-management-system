/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#22d3ee',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        gradientShift: 'gradientShift 10s ease infinite',
        float: 'float 3s ease-in-out infinite',
        fadeInUp: 'fadeInUp 900ms ease both',
        fadeInUpDelayed: 'fadeInUp 900ms ease 120ms both',
        fadeIn: 'fadeIn 1.2s ease 500ms both',
      },
      backgroundImage: {
        gradientLanding: 'linear-gradient(120deg, #0f172a, #1e293b)',
        markRadial: 'radial-gradient(circle at 50% 50%, #22d3ee, transparent 65%)',
      },
      dropShadow: {
        mark: '0 6px 16px rgba(34, 211, 238, 0.3)',
      },
    },
  },
  plugins: [],
}



/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: { 
    extend: {
      colors: {
        azure: {
          DEFAULT: '#33aaff',
          50: '#e6f3ff',
          100: '#cfe9ff',
          200: '#a8d8ff',
          300: '#7dc5ff',
          400: '#55b4ff',
          500: '#33aaff',
          600: '#199de6',
          700: '#0d86c4',
          800: '#0a6c9e',
          900: '#074a6b',
        },
        graphite: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#808080',
          500: '#404040',
          600: '#303030',
          700: '#202020',
          800: '#1a1a1a',
          900: '#161618',
          950: '#0f0f10',
        }
      }
    } 
  },
  plugins: [],
};

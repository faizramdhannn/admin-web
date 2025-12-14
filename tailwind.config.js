/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode
        dark: {
          bg: '#0A0A0A',
          card: '#1A1A1A',
          panel: '#2D2D2D',
          border: '#404040',
          text: '#FFFFFF',
          muted: '#B3B3B3',
        },
        // Light Mode
        light: {
          bg: '#F7F7F7',
          card: '#FFFFFF',
          panel: '#FAFAFA',
          border: '#E5E5E5',
          text: '#1A1A1A',
          muted: '#666666',
        },
        // Accent
        primary: {
          50: '#E6F7F3',
          100: '#B3E8DB',
          500: '#00A67E',
          600: '#008C6A',
          700: '#007256',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
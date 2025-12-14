/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        light: {
          bg: '#f7f7f7',
          card: '#ffffff',
          text: '#1a1a1a',
          muted: '#6b7280',
          border: '#e5e7eb',
        },
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          text: '#ffffff',
          muted: '#9ca3af',
          border: '#2d2d2d',
        },
      },
      boxShadow: {
        'sm-light': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg-light': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'sm-dark': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'md-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.7)',
        'lg-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.9)',
      },
    },
  },
  plugins: [],
}
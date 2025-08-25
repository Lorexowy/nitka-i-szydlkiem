/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors - niebiesko-beżowo-kremowa paleta
        brand: {
          50: '#f8fafc',   // bardzo jasny niebieski
          100: '#f1f5f9',  // jasny niebieski
          200: '#e2e8f0',  // delikatny niebieski
          300: '#cbd5e1',  // średni niebieski
          400: '#94a3b8',  // niebieskoszary
          500: '#64748b',  // główny niebieski
          600: '#475569',  // ciemny niebieski
          700: '#334155',  // bardzo ciemny niebieski
          800: '#1e293b',  // prawie czarny niebieski
          900: '#0f172a',  // najciemniejszy
        },
        // Niebieska paleta - główny kolor
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // główny niebieski
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Beżowa paleta
        beige: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf2e9',
          300: '#fae8d4',
          400: '#f6d5af',
          500: '#f0c087',  // główny beżowy
          600: '#e8a c4',
          700: '#d69020',
          800: '#b17318',
          900: '#8e5d17',
        },
        // Kremowa paleta
        cream: {
          50: '#fffffe',
          100: '#fffef7',
          200: '#fffce8',
          300: '#fff8d1',
          400: '#fff0a8',
          500: '#ffe66f',  // główny kremowy
          600: '#f5d449',
          700: '#ddb834',
          800: '#b8962c',
          900: '#957826',
        },
        // Neutrale - szare odcienie z ciepłym podtonem
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
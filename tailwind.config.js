/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f4f2f0',
          100: '#e9e5e1',
          200: '#cfc7bf',
          300: '#b3a79b',
          400: '#8f7f70',
          500: '#6f5e50',
          600: '#58483c',
          700: '#44372e',
          800: '#2f2620',
          900: '#1e1814',
        },
        tide: {
          50: '#eef6f4',
          100: '#d5ebe5',
          200: '#b0d6cd',
          300: '#84bdae',
          400: '#5b9e8b',
          500: '#417a6b',
          600: '#335f54',
          700: '#2b4c44',
          800: '#213833',
          900: '#152521',
        },
        ember: {
          100: '#fef0e6',
          300: '#f6b486',
          500: '#e8784a',
          700: '#b94d2c',
          900: '#7a2e1c',
        },
      },
      boxShadow: {
        soft: '0 24px 70px -50px rgba(21, 37, 33, 0.55)',
      },
    },
  },
  plugins: [],
}

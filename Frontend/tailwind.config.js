/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Rajdhani"', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#02050f',
          900: '#040a1a',
          800: '#071022',
          700: '#0b1830',
          600: '#112240',
          500: '#172d52',
        },
        slate: {
          text: '#94a3b8',
          dim: '#475569',
          border: '#1e3a5f',
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

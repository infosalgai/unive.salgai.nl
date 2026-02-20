/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D3182',
          dark: '#222870',
        },
        accent: {
          DEFAULT: '#F7A521',
          dark: '#E09518',
        },
        background: '#F4F5F0',
        heading: '#2D3182',
        body: '#555555',
        subtle: '#888888',
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'sans-serif'],
      },
      borderRadius: {
        pill: '50px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.07)',
        nav: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

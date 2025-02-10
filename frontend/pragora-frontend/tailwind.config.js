// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/contexts/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/lib/**/*.{js,jsx,ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9400D3',
        'primary-dark': '#7b00b3',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        united: {
          navy:  '#003087',
          blue:  '#0056B8',
          gold:  '#C8960C',
          light: '#F5F7FA',
        },
      },
    },
  },
  plugins: [],
}

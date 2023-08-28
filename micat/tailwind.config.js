/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ["Open Sans", "Arial", "Helvetica", "sans-serif"],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

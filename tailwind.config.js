/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // For Vite projects, or if your main HTML is at the root
    "./src/**/*.{js,ts,jsx,tsx}", // This covers all relevant files in your src folder
  ],
  darkMode: 'class', // The provided code uses 'dark:' prefixes, so 'class' mode is appropriate.
  theme: {
    extend: {},
  },
  plugins: [],
}
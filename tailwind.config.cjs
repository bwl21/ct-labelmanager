/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ChurchTools color palette
        'ct-primary': '#007cba',
        'ct-secondary': '#6c757d',
        'ct-success': '#28a745',
        'ct-info': '#17a2b8',
        'ct-warning': '#ffc107',
        'ct-danger': '#dc3545',
        'ct-light': '#f8f9fa',
        'ct-dark': '#343a40',
      }
    },
  },
  plugins: [],
}
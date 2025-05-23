/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',  /* sky-50 */
          100: '#e0f2fe', /* sky-100 */
          200: '#bae6fd', /* sky-200 */
          300: '#7dd3fc', /* sky-300 */
          400: '#38bdf8', /* sky-400 */
          500: '#0ea5e9', /* sky-500 */
          600: '#0284c7', /* sky-600 */
          700: '#0369a1', /* sky-700 */
          800: '#075985', /* sky-800 */
          900: '#0c4a6e', /* sky-900 */
          950: '#082f49', /* sky-950 */
        },
        secondary: {
          50: '#f5f3ff',  /* purple-50 */
          100: '#ede9fe', /* purple-100 */
          200: '#ddd6fe', /* purple-200 */
          300: '#c4b5fd', /* purple-300 */
          400: '#a78bfa', /* purple-400 */
          500: '#8b5cf6', /* purple-500 */
          600: '#7c3aed', /* purple-600 */
          700: '#6d28d9', /* purple-700 */
          800: '#5b21b6', /* purple-800 */
          900: '#4c1d95', /* purple-900 */
          950: '#2e1065', /* purple-950 */
        },
        white: '#ffffff',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

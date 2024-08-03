 /** @type {Config} */ 
/** @typedef {import('tailwindcss').Config} Config */
export default {
  content: ['src/**/*.tsx'],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
}


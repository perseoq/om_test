/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        om: {
          green:  '#007A33',
          navy:   '#00263E',
          bg:     '#F7F7F7',
          text:   '#1C1C1C',
          muted:  '#656463',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

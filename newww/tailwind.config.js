/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf6f2",
          100: "#fbe8d9",
          200: "#f7d0b3",
          300: "#f3b88d",
          400: "#ef9f67",
          500: "#eb8741",
          600: "#b86b34",
          700: "#864f27",
          800: "#53341a",
          900: "#21180d",
          950: "#100c06",
          1000: "#cb8959"
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      // colors: {}
    }
  },
  plugins: [],
}

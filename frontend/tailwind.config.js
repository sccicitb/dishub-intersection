/** @type {import('tailwindcss').Config} */
export default {
  future: {
    useOkLchColors: false,
  },
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // ubuntu: ["var(--font-ubuntu)", "system-ui", "sans-serif"],
        // mono: ["var(--font-ubuntu-mono)", "monospace"],
        sans: ['var(--font-jakarta)', 'sans-serif'],
      },
        colors: {
        // 'primary': 'oklch(0.7 0.2 230)' becomes:
        'primary': '#3b82f6', 
      },
      backgroundImage: {
        'login-bg': "url('/image/bg-login-viana.png')",
      },
    },
  },
  plugins: [
    require("daisyui")
  ],
}
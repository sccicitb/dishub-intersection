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
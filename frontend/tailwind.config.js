/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        'login-bg': "url('/image/bg-login-viana.png')",
      },
    },
  },
  plugins: [
    require("daisyui")
  ]
}
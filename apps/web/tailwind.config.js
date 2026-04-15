/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      animation: {
        marquee: "marquee 18s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      colors: {
        // Flat design system colors
        'flat-primary': '#1D9E75',
        'flat-page-bg': '#F5F5F3',
        'flat-dark-accent': '#0F6E56',
      },
      borderWidth: {
        // Flat design system border width
        'flat': '0.5px',
      },
      borderRadius: {
        // Flat design system border radius
        'flat-sm': '8px',
        'flat-card': '12px',
      },
      spacing: {
        // Sidebar width
        'sidebar': '220px',
      },
    },
  },
  plugins: [],
};
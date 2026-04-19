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
      // Premium glassmorphism effects
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
        'glass-xl': '0 20px 60px 0 rgba(31, 38, 135, 0.25)',
        'premium': '0 10px 40px -10px rgba(20, 215, 180, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'premium-hover': '0 20px 60px -10px rgba(20, 215, 180, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
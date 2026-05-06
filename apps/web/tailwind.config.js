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
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],      // 13px
        sm: ['0.9375rem', { lineHeight: '1.5rem' }],       // 15px
        base: ['1.0625rem', { lineHeight: '1.75rem' }],    // 17px (increased from 16px)
        lg: ['1.1875rem', { lineHeight: '1.875rem' }],     // 19px
        xl: ['1.3125rem', { lineHeight: '2rem' }],         // 21px
        '2xl': ['1.5625rem', { lineHeight: '2.25rem' }],   // 25px
        '3xl': ['1.9375rem', { lineHeight: '2.5rem' }],    // 31px
        '4xl': ['2.4375rem', { lineHeight: '3rem' }],      // 39px
        '5xl': ['3.0625rem', { lineHeight: '3.5rem' }],    // 49px
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
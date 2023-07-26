module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/gradients.ts'
  ],
  theme: {
    extend: {
      colors: {
        'dark-accent-1': '#111111',
        'dark-accent-2': '#333333',
        'dark-accent-3': '#444444',
        'dark-accent-5': '#888888'
      },
      screens: {
        'cu': '370px', // Custom extra-small screen size
        // 'md': '768px', // Custom medium screen size
        // 'lg': '1024px', // Custom large screen size
        // 'xl': '1280px', // Custom extra-large screen size
      },
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};

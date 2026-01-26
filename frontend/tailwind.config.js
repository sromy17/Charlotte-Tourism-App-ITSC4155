module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "uncc-green": "#00703C",
        "uncc-gold": "#B3A369",
      },
      animation: {
        "pulse-red": "pulse-red 2s infinite",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { 
            opacity: "1",
            transform: "scale(1)"
          },
          "50%": { 
            opacity: "0.7",
            transform: "scale(1.1)"
          },
        }
      }
    },
  },
  plugins: [],
}

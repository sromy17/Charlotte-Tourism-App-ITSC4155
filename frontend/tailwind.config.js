module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "uncc-green": "#00703C",
        "uncc-gold": "#B3A369",
        "obsidian": "#080808",
        "bone-white": "#F9F8F3",
        "dark-bg": "#080808",
        "dark-surface": "#181818",
        "accent-cyan": "#06b6d4",
      },
      fontFamily: {
        'serif-headline': ["'Instrument Serif'", 'serif'],
        'inter': ["'Inter'", 'sans-serif'],
      },
      animation: {
  "slow-zoom": "slow-zoom 20s infinite alternate ease-in-out",
},
keyframes: {
  "slow-zoom": {
    "0%": { transform: "scale(1)" },
    "100%": { transform: "scale(1.1)" },
  }
}
    },
  },
  plugins: [],
}
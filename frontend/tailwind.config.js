module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "royal-emerald": "#004D2C", // The Deeper, Executive Green
        "royal-gold": "#99814D",    // The Muted, Professional Gold
        "fairway-gold": "#D6C08E",
        "charcoal": "#020202",
        "mist": "#F6F3EB",
        "uncc-green": "#00703C",
        "uncc-gold": "#B3A369",
        "obsidian": "#020202",
        "bone-white": "#F9F8F3",
      },
      fontFamily: {
        'serif-headline': ["'Playfair Display'", 'serif'],
        'inter': ["'Inter'", 'sans-serif'],
        'mono-tech': ["'IBM Plex Mono'", 'monospace'],
      },
      animation: {
        "slow-zoom": "slow-zoom 20s infinite alternate ease-in-out",
        "border-trace": "border-trace 4s linear infinite",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "slow-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        "border-trace": {
          "0%, 100%": { clipPath: "inset(0 0 98% 0)" },
          "25%": { clipPath: "inset(0 98% 0 0)" },
          "50%": { clipPath: "inset(98% 0 0 0)" },
          "75%": { clipPath: "inset(0 0 0 98%)" },
        }
      }
    },
  },
  plugins: [],
}
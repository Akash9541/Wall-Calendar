module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        flipIn: {
          "0%": {
            transform: "perspective(1000px) rotateY(90deg)",
            opacity: "0",
          },
          "100%": {
            transform: "perspective(1000px) rotateY(0deg)",
            opacity: "1",
          },
        },
        flipOut: {
          "0%": {
            transform: "perspective(1000px) rotateY(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "perspective(1000px) rotateY(-90deg)",
            opacity: "0",
          },
        },
      },
      animation: {
        "flip-in": "flipIn 0.28s ease-out forwards",
        "flip-out": "flipOut 0.18s ease-in forwards",
      },
    },
  },
  plugins: [],
};
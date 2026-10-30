/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        larder: {
          olive: "#556B2F",
          terracotta: "#C26D4C",
          linen: "#F9F6F0",
          alabaster: "#FFFFFF",
          espresso: "#2C2523",

          "olive-soft": "#EDF1E6",
          "terracotta-soft": "#F7E9E3",
          "terracotta-deep": "#8F4933",
          border: "#E8E0D6",
          muted: "#746861",
        },
      },

      fontFamily: {
        sans: ["Satoshi-Regular"],
        satoshi: ["Satoshi-Regular"],
        "satoshi-medium": ["Satoshi-Medium"],
        "satoshi-bold": ["Satoshi-Bold"],
        "satoshi-black": ["Satoshi-Black"],
      },

      letterSpacing: {
        display: "-0.02em",
      },
    },
  },

  plugins: [],
};
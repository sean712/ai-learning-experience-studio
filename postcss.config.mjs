// Tailwind CSS v4 is wired in through its PostCSS plugin. No tailwind.config
// file is needed: v4 auto-detects the class names used across the app folder.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

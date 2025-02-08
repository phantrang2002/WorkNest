import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'primary-color': 'var(--primary-color)',
        'black-color': 'var(--black-color)',     
        
        

        'brighter-color': 'var(--brighter-color)',  // Corrected from `--brighter-color`
        'darker-color': 'var(--darker-color)',      // Corrected from `--darker-color`
        'yellow-color': 'var(--yellow-color)',      // Corrected from `--yellow-color`
        'pastel-color': 'var(--pastel-color)',  

      },
    },
  },
  plugins: [],
};
export default config;

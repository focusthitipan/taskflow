import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "320px",
      "2sm": "380px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
      "2xl": "1600px",
      "3xl": "1920px",
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Brand palette (driven by CSS variables for dynamic accent color)
        brand: {
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          900: "hsl(var(--brand-900))",
        },
        // Secondary gray (cool blue-gray)
        secondaryGray: {
          100: "#E0E5F2",
          200: "#E1E9F8",
          300: "#F4F7FE",
          400: "#E9EDF7",
          500: "#8F9BBA",
          600: "#A3AED0",
          700: "#707EAE",
          900: "#1B2559",
        },
        // Navy palette (dark mode surfaces)
        navy: {
          400: "#3652ba",
          500: "#1b3bbb",
          700: "#1B254B",
          800: "#111c44",
          900: "#0b1437",
        },
        // Semantic colors
        green: {
          100: "#E6FAF5",
          500: "#01B574",
        },
        red: {
          100: "#FEEFEE",
          500: "#EE5D50",
        },
        orange: {
          100: "#FFF6DA",
          500: "#FFB547",
        },
        blue: {
          50: "#EFF4FB",
          500: "#3965FF",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "[5px]": "5px",
        "[8px]": "8px",
        "[10px]": "10px",
        "[20px]": "20px",
        "[30px]": "30px",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        card: "14px 17px 40px 4px rgba(112,144,176,0.08)",
        button: "45px 76px 113px 7px rgba(112,144,176,0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

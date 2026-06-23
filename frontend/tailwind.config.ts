import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {

        extend: {
            colors: {
                primary: "#2563eb",
                "primary-hover": "#1447e6",
                "text-default": "#111111",
                muted: "#62748e",
                background: "#ffffff",
                "surface-deep": "#1d293d",

                danger: "#fb2c36",
                "danger-hover": "#9f0712"

            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            spacing: {
                '128': '32rem',
            },
        },
    },
    plugins: [],
};

export default config;
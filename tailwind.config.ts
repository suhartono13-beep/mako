import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // 👈 开启暗黑模式支持
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 完美匹配你没有 src 的 app 目录
  ],
  theme: {
    extend: {
      // 👇 从这里开始注入微动效配置
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      // 👆 微动效配置结束
    },
  },
  plugins: [],
};
export default config;
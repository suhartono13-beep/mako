import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 剔除硬核全息青与钛金底色，替换为唯美的暮色星海色系
        mako: {
          bg: "#060913",         // 深邃的暮色星穹基底
          panel: "rgba(22, 31, 54, 0.45)", // 通透的毛玻璃衬底
          border: "rgba(255, 255, 255, 0.08)", // 空气感微光描边
          primary: "#8EC5FC",    // 晴空微光蓝（主高亮）
          accent: "#E0C3FC",     // 薰衣草晚霞紫（特殊状态）
          text: "#F1F5F9",       // 高通透白文本
          muted: "#64748B",      // 迷雾灰次要文本
        }
      },
      backgroundImage: {
        // 唯美动漫感：黄昏交界至极夜星海的柔和渐变
        "mako-twilight": "linear-gradient(135deg, #05070F 0%, #0B132B 45%, #1C2541 100%)",
      },
      borderRadius: {
        "os-card": "24px",       // 柔和、去机械化的大圆角
        "os-btn": "12px",
      },
      boxShadow: {
        // 呼吸微光效应，替代原本强烈的赛博朋克发光
        "os-glow": "0 0 25px rgba(142, 197, 252, 0.08)",
        "os-glow-hover": "0 0 35px rgba(142, 197, 252, 0.22)",
        "os-accent-glow": "0 0 25px rgba(224, 195, 252, 0.15)",
      },
    },
  },
  plugins: [],
}
export default config
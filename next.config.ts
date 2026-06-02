/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 告诉 Next.js 将网站打包为静态网页 (SPA 模式)
  images: {
    unoptimized: true, // 静态模式下关闭 Next.js 默认的图片优化
  },
};

export default nextConfig;
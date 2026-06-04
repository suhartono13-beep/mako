import type { Metadata, Viewport } from "next"; // 👈 新增引入 Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. 🎯 更新网站元数据，并指向刚才建好的 manifest.json
export const metadata: Metadata = {
  title: "Mako's Personal OS",
  description: "Next-Gen Personal Operating System & Knowledge Base",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png", // 👈 改成你本地的本地图标路径
  },
  appleWebApp: {
    capable: true,
    title: "Personal OS",
    statusBarStyle: "black-translucent",
  },
};

// 2. 🎯 新增 viewport 配置，让手机浏览器顶部状态栏变成极客暗色
export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning // 3. 🎯 顺手加了这个，彻底解决翻译插件引起的红屏报错
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
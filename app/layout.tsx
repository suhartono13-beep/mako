'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import AmbientBackground from './components/ui/AmbientBackground';
import '@/app/globals.css';
import MakoChan from './components/ui/MakoChan';

// ═══════════════════════════════════════════════════════════════
// 👑 Mako OS v1.4.0 — Root Layout (Frosted Canvas Edition)
// 职责：Auth Guard / Navbar / 全屏背景 / FX 模式挂载
// ═══════════════════════════════════════════════════════════════

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { session, email, setEmail, password, setPassword, authLoading, handleLogin, handleLogout } = useAuth();
  const { mode, label, cycleMode } = usePerformanceMode();

  // 注册 Service Worker (PWA)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW failed', err));
      });
    }
  }, []);

  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <title>Mako OS | Frosted Canvas</title>
        <meta name="description" content="Personal Operating System — Frosted Glass Interface" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mako OS" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>

      <body className="antialiased min-h-screen flex flex-col font-sans overflow-x-hidden">
        {/* 🖼️ 全屏插画背景 */}
        <AmbientBackground />
        <MakoChan />

        {/* 🔔 全局通知 */}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            className: 'backdrop-blur-xl bg-white/70 text-mako-text border border-white/30 shadow-lg',
          }}
        />

        {/* 根据 Session 状态进行视图拦截 */}
        {!session ? (
          // ─── 🔒 登录墙 ───
          <main className="flex-1 w-screen flex flex-col justify-center items-center relative z-10 animate-fade-in">
            <div className="w-full max-w-sm p-8 mako-card">
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto bg-mako-accent/10 border border-mako-accent/20 rounded-2xl flex items-center justify-center font-bold text-xl text-mako-accent mb-4 animate-float">
                  OS
                </div>
                <h1 className="text-2xl font-semibold tracking-wide text-mako-text">Mako 观测站</h1>
                <p className="text-sm text-mako-text-muted mt-2">未检测到以太波长，请同步凭证</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="接入标识 (Email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mako-input"
                  required
                  autoComplete="email"
                />
                <input
                  type="password"
                  placeholder="密钥 (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mako-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-4 mako-btn-primary"
                >
                  {authLoading ? '神经元同步中...' : '建立连接'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <span className="mako-badge-default">v1.4.0</span>
              </div>
            </div>
          </main>
        ) : (
          // ─── 🌸 已认证：系统主壳 ───
          <div className="flex-1 flex flex-col w-full relative z-10 animate-fade-in">
            {/* 看板娘 */}
            <MakoChan />
            {/* ═══ Navbar: 毛玻璃控制条 ═══ */}
            <nav className="sticky top-0 z-50 mako-navbar">
              <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

                {/* 左侧：Logo + 系统名 */}
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 rounded-xl bg-mako-accent/10 border border-mako-accent/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-md">
                    <span className="text-mako-accent font-bold text-sm">OS</span>
                  </div>
                  <span className="text-base font-semibold tracking-wider text-mako-text hidden sm:block">
                    Mako <span className="text-mako-text-muted font-normal text-sm">Canvas</span>
                  </span>
                </Link>

                {/* 右侧：控制区 */}
                <div className="flex items-center space-x-2 sm:space-x-4 text-sm">

                  {/* 导航链接 */}
                  <Link href="/" className="mako-btn-ghost hidden md:inline-flex">
                    Dashboard
                  </Link>
                  <Link href="/terminal" className="mako-btn-ghost hidden md:inline-flex">
                    Terminal
                  </Link>
                  <Link
                    href="/galaxy"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-mako-accent-warm hover:text-mako-accent-warm-hover transition-colors"
                  >
                    <span>🌌</span>
                    <span>Galaxy</span>
                  </Link>

                  {/* 分隔线 */}
                  <div className="h-4 w-px bg-mako-card-border hidden md:block" />

                  {/* FX 模式切换 */}
                  <button
                    onClick={cycleMode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-full bg-white/40 border border-white/30 hover:bg-white/60 hover:border-mako-accent/30 text-mako-text-secondary hover:text-mako-accent transition-all"
                    title={`Performance Mode: ${label}`}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        mode === 'full' ? 'bg-mako-accent animate-ping' :
                        mode === 'balanced' ? 'bg-mako-success' :
                        'bg-mako-text-muted'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        mode === 'full' ? 'bg-mako-accent' :
                        mode === 'balanced' ? 'bg-mako-success' :
                        'bg-mako-text-muted'
                      }`} />
                    </span>
                    <span className="hidden sm:inline">FX: {label}</span>
                  </button>

                  {/* Kernel 入口 */}
                  <Link
                    href="/system"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-white/40 border border-white/30 text-mako-text-secondary rounded-full hover:bg-white/60 hover:text-mako-text transition-all"
                  >
                    <span>🤖</span>
                    <span className="hidden sm:inline">KERNEL</span>
                  </Link>

                  {/* 断开连接 */}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full text-mako-text-muted bg-white/30 border border-transparent hover:bg-red-50 hover:text-mako-danger hover:border-red-200 transition-all"
                  >
                    <span className="hidden sm:inline">断开连接</span>
                    <span className="sm:hidden">⏻</span>
                  </button>
                </div>
              </div>
            </nav>

            {/* ═══ 主内容区 ═══ */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
              {children}
            </main>

            {/* ═══ 底部系统签名 ═══ */}
            <footer className="py-6 text-center">
              <div className="inline-block px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/20">
                <p className="text-[10px] font-mono text-mako-text-muted tracking-widest uppercase">
                  Mako OS v1.4.0 · Frosted Canvas · Static Export
                </p>
              </div>
            </footer>
          </div>
        )}
      </body>
    </html>
  );
}
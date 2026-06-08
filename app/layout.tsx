'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider'; 
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import '@/app/globals.css';

// ------------------------------------------------------------------
// 🌙 丝滑主题切换组件 (内置)
// ------------------------------------------------------------------
function NavbarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免客户端与服务端渲染不一致导致的 Hydration 报错
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />; // 占位防抖

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-lg focus:outline-none"
      title="Toggle Orbit Theme"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

// ------------------------------------------------------------------
// 👑 核心全局 Layout
// ------------------------------------------------------------------
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 🪄 一行代码接管所有业务逻辑
  const { session, email, setEmail, password, setPassword, authLoading, handleLogin, handleLogout } = useAuth();

  // 注册 Service Worker (PWA)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW failed', err));
      });
    }
  }, []);

  // ------------------------------------------------------------------
  // 🧩 静态/全局 注入件
  // ------------------------------------------------------------------
  const AppToaster = (
    <Toaster 
      richColors 
      position="top-right" 
      toastOptions={{
        className: 'dark:bg-[#1C1C1E] dark:text-white dark:border-white/10 backdrop-blur-xl',
      }}
    />
  );

  const HtmlHead = (
    <head>
      <title>Mako Space | OS</title>
      <meta name="description" content="Next-Gen Personal Knowledge Base" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Mako Space" />
      <meta name="theme-color" content="#0A0A0C" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    </head>
  );

  // ------------------------------------------------------------------
  // 🖥️ 唯一 DOM 树返回
  // ------------------------------------------------------------------
  return (
    <html lang="zh" suppressHydrationWarning> 
      {HtmlHead}
      <body className="antialiased text-gray-900 dark:text-gray-100 transition-colors duration-500 min-h-screen flex flex-col font-sans overflow-x-hidden bg-[#F5F5F7] dark:bg-[#0A0A0C]">
        
        {/* 全局注入 ThemeProvider */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          
          {/* 统一的全局背景/环境光（不论登录还是未登录，保持视觉连贯） */}
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-[120px]" />
            <div className="absolute top-[30%] left-[60%] w-[40%] h-[40%] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[100px]" />
          </div>

          {AppToaster}

          {/* 根据 Session 状态进行路由/视图拦截 */}
          {!session ? (
            // --- 🔒 极简登录墙 ---
            <main className="flex-1 w-screen flex flex-col justify-center items-center relative z-10 animate-fade-in">
              <div className="w-full max-w-sm p-8 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-black/[0.04] dark:border-white/[0.04] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 mx-auto bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-sm">OS</div>
                  <h1 className="text-2xl font-semibold tracking-tight">Mako Space</h1>
                  <p className="text-sm text-gray-500 mt-1">Please sign in to continue</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="email" placeholder="Apple ID / Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-black/50 border border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" required />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-black/50 border border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" required />
                  <button type="submit" disabled={authLoading} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>
            </main>
          ) : (
            // --- 🌌 登录后：全局极简外壳 ---
            <div className="flex-1 flex flex-col w-full relative z-10 animate-fade-in">
              <nav className="sticky top-0 z-50 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl saturate-150 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                  <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-8 h-8 rounded-xl bg-black dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
                      <span className="text-white dark:text-black font-bold text-sm">OS</span>
                    </div>
                    <span className="text-base font-semibold tracking-tight">Mako Space</span>
                  </Link>
                  
                  <div className="flex items-center space-x-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-black dark:hover:text-white transition-colors hidden md:block">Dashboard</Link>
                    <Link href="/terminal" className="hover:text-black dark:hover:text-white transition-colors hidden md:block">Terminal</Link>
                    <Link href="/galaxy" className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 transition-colors pr-2">🌌 Galaxy</Link>
                    
                    {/* 🚀 新增：全局系统内核入口，悬浮于整个操作系统的右上角 */}
                    <Link 
                      href="/system" 
                      className="text-xs font-mono font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 rounded-full hover:scale-105 transition-all shadow-sm flex items-center space-x-1"
                    >
                      <span>🤖</span>
                      <span className="hidden md:inline">KERNEL</span>
                    </Link>

                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 hidden md:block ml-2" />
                    
                    {/* 融合后的丝滑主题切换组件 */}
                    <NavbarThemeToggle />

                    <button onClick={handleLogout} className="text-xs font-semibold bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-1.5 rounded-full transition-colors ml-2">
                      Log Out
                    </button>
                  </div>
                </div>
              </nav>

              <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
                {children}
              </main>
            </div>
          )}

        </ThemeProvider>
      </body>
    </html>
  );
}
'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/globals.css'; // 确保引入了你的全局样式

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // PWA 注册
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('🛸 Mako OS 内核同步成功: ', reg.scope),
          (err) => console.log('❌ 内核同步失败: ', err)
        );
      });
    }
  }, []);

  // 暗黑模式初始化
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // 监听 Auth 状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) alert('登录失败: ' + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- 拦截器：未登录状态渲染登录墙 ---
  if (!session) {
    return (
      <html lang="zh">
        <body>
          <main className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
            <div className="fixed inset-0 -z-10 w-full h-full bg-slate-50 dark:bg-[#09090b] bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-indigo-500/5 via-purple-500/10 to-cyan-500/5 blur-[120px] rounded-full"></div>
            </div>
            <div className="w-full max-w-md p-8 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">Mako's Neural Net</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono uppercase tracking-widest">System Authorization Required</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <input type="email" placeholder="Identity (Email)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" required />
                <input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" required />
                <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                  {authLoading ? 'Authenticating...' : 'INITIALIZE CONNECTION'}
                </button>
              </form>
            </div>
          </main>
        </body>
      </html>
    );
  }

  // --- 已登录状态：全局共享的外壳架构 ---
  return (
    <html lang="zh">
      <body className="bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-slate-100 transition-colors duration-500 min-h-screen flex flex-col">
        {/* 固定背景层 */}
        <div className="fixed inset-0 -z-10 w-full h-full bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-indigo-500/5 via-purple-500/10 to-cyan-500/5 blur-[120px] rounded-full"></div>
        </div>

        {/* 顶部导航 */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#09090b]/70 border-b border-slate-200/50 dark:border-white/5">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Mako's Space</h1>
                <div className="flex items-center mt-0.5 space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-wider">Sys Online</span>
                </div>
              </div>
            </Link>
            <div className="flex items-center space-x-6 text-sm font-bold">
              <Link href="/" className="hover:text-indigo-500 transition-colors">Dashboard</Link>
              <Link href="/terminal" className="hover:text-indigo-500 transition-colors">Terminal</Link>
              <Link href="/matrix" className="hover:text-indigo-500 transition-colors">Matrix</Link>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
              <button onClick={toggleDarkMode} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform shadow-sm">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={handleLogout} className="text-xs font-semibold bg-slate-800 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full hover:opacity-80 transition-opacity shadow-md">
                Disconnect
              </button>
            </div>
          </div>
        </nav>

        {/* 页面主容器 - 增加了大尺寸内衬，消除拥挤感 */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner'; // 引入 sonner
import '@/app/globals.css';

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

  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
    }
  }, []);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    
    if (error) {
      toast.error('Sign In Failed', { description: error.message });
    } else {
      toast.success('Welcome Back');
    }
  };

  const handleLogout = async () => supabase.auth.signOut();

  // 核心：把 Toaster 提取到最前面，配置好苹果毛玻璃质感
  const AppToaster = (
    <Toaster 
      position="top-center" 
      toastOptions={{
        className: 'bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border-black/[0.05] dark:border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl text-black dark:text-white font-sans',
      }} 
    />
  );

  // --- 拦截器：极简登录墙 ---
  if (!session) {
    return (
      <html lang="zh" suppressHydrationWarning> 
        <body>
          {AppToaster} 
          <main className="min-h-screen flex flex-col justify-center items-center bg-[#F5F5F7] dark:bg-black text-black dark:text-white transition-colors duration-500">
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
        </body>
      </html>
    );
  }

  // --- 登录后：全局极简外壳 ---
  return (
    <html lang="zh" suppressHydrationWarning> 
      <body className="relative bg-[#F5F5F7]/80 dark:bg-[#0A0A0C] text-gray-900 dark:text-gray-100 transition-colors duration-500 min-h-screen flex flex-col font-sans overflow-x-hidden">
        
        {/* ✨ 核心魔法：全屏环境光渐变 (Mesh Gradient) ✨ */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-[120px]" />
          <div className="absolute top-[30%] left-[60%] w-[40%] h-[40%] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[100px]" />
        </div>

        {AppToaster} {/* 登录后主界面注入 Toaster */}
        
        {/* 导航栏：因为有了背景光，这里的毛玻璃会变得非常明显 */}
        <nav className="sticky top-0 z-50 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl saturate-150 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-xl bg-black dark:bg-white flex items-center justify-center transition-transform">
                <span className="text-white dark:text-black font-bold text-sm">OS</span>
              </div>
              <span className="text-base font-semibold tracking-tight">Mako Space</span>
            </Link>
            
            <div className="flex items-center space-x-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
              <Link href="/terminal" className="hover:text-black dark:hover:text-white transition-colors">Terminal</Link>
              <Link href="/matrix" className="hover:text-black dark:hover:text-white transition-colors">Matrix</Link>
              
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700" />
              
              <button onClick={toggleDarkMode} className="p-1 hover:text-black dark:hover:text-white transition-colors">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={handleLogout} className="text-xs font-semibold bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-1.5 rounded-full transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </nav>

        {/* 页面主容器 */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
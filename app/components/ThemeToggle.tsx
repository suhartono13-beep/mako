'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 必须等待客户端挂载完毕，否则会导致服务端和客户端渲染的图标不一致（报错）
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 p-4 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg z-[100] w-12 h-12 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl z-[100] transition-all hover:scale-110 active:scale-95 flex items-center justify-center text-xl"
      aria-label="Toggle Dark Mode"
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
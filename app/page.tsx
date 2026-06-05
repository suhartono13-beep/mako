'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 极简 Hero 巨幕 */}
      <section className="space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white">
          Welcome back.
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          This is your personal workspace and knowledge hub. Synchronized securely via Supabase. Everything is up to date.
        </p>
      </section>

      {/* Apple 风格状态面板 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Engine</p>
          <p className="text-lg font-semibold">Next.js Core</p>
        </div>
        <div className="p-5 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Database</p>
          <p className="text-lg font-semibold text-blue-500">Supabase</p>
        </div>
        <div className="p-5 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl shadow-sm col-span-2 md:col-span-2 flex justify-between items-center">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <p className="text-lg font-semibold">All Systems Nominal</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
      </div>

      {/* 极简空间入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Link href="/terminal" className="group block p-8 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl mb-6 group-hover:scale-105 transition-transform">
            ⌘
          </div>
          <h3 className="text-xl font-semibold mb-2">Terminal</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Create new data blocks, flashcards, or document your thoughts in a distraction-free environment.
          </p>
        </Link>

        <Link href="/matrix" className="group block p-8 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-2xl flex items-center justify-center text-xl mb-6 group-hover:scale-105 transition-transform">
            ⚲
          </div>
          <h3 className="text-xl font-semibold mb-2">Matrix</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Access your synchronized knowledge base. Search, filter, and review your vocabulary and notes instantly.
          </p>
        </Link>
      </div>
    </div>
  );
}
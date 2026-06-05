'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* 🌌 Welcome Hero 巨幕 */}
      <section className="relative p-8 md:p-12 bg-white/40 dark:bg-white/[0.01] backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full"></div>
        
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-mono tracking-wider uppercase">
            <span>📡 Protocol active // Core-Space</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400">Mako's Space</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            这是你的私人数字视界与知识中枢。基于 Nest 骨干网，接入 Supabase 云端矩阵。思想在这里沉淀为区块，语言在这里重构为节点。
          </p>
        </div>

        {/* 📊 实时系统指标卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-200/50 dark:border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Core Engine</p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono">Cloudflare + Nest</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Database Relay</p>
            <p className="text-xl font-black text-indigo-500 font-mono">Supabase Sync</p>
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Security Mode</p>
            <p className="text-sm font-bold text-emerald-500 flex items-center h-7 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping"></span>
              AES-AUTHORIZED
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 空间分流卡片（加宽、增大呼吸感） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/terminal" className="group p-8 bg-slate-900 dark:bg-white/[0.01] border border-slate-800 dark:border-white/5 rounded-[2rem] hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="text-3xl">🔮</div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Execute terminal →</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">智能输入终端</h3>
          <p className="text-xs text-slate-400 leading-relaxed">提供无干扰的数据注入环境。在此处提交新的记忆区块或扩充 Vocab 词汇矩阵。支持 Markdown 实时解析与多模态图像上传。</p>
        </Link>

        <Link href="/matrix" className="group p-8 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[2rem] hover:border-cyan-400/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="text-3xl">🧠</div>
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Query matrix →</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">数据流矩阵</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">全量归档记忆区块的调阅中心。提供高自由度的模糊检索与分类过滤。内置针对语言学习的“闪卡解密（Flashcards）”沙盒模式。</p>
        </Link>
      </div>
    </div>
  );
}
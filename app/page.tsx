'use client';

import Link from 'next/link';
import { SPACE_CONFIGS } from '@/config/systemManifest';

// ═══════════════════════════════════════════════════════════════
// 🖥️ Mako OS v1.4.0 — Dashboard (Frosted Canvas Console)
// 系统启动 → 意识接入 → 个人控制台
// ═══════════════════════════════════════════════════════════════

// 空间卡片主题色映射
const SPACE_STYLES: Record<string, {
  text: string;
  bg: string;
  iconBg: string;
  iconBorder: string;
  indicator: string;
  hoverGlow: string;
}> = {
  learning: {
    text: 'text-blue-600',
    bg: 'bg-blue-500/5',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-200',
    indicator: 'bg-blue-500',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(91,127,255,0.12)]',
  },
  work: {
    text: 'text-violet-600',
    bg: 'bg-violet-500/5',
    iconBg: 'bg-violet-50',
    iconBorder: 'border-violet-200',
    indicator: 'bg-violet-500',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.12)]',
  },
  life: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-200',
    indicator: 'bg-emerald-500',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.12)]',
  },
  entertainment: {
    text: 'text-amber-600',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-200',
    indicator: 'bg-amber-500',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.12)]',
  },
};

export default function Dashboard() {
  return (
    <div className="space-y-16 animate-fade-in">

      {/* ═══ Hero 区 ═══ */}
      <section className="text-center space-y-6 pt-8 md:pt-12">
        <div className="inline-flex items-center gap-2 mako-badge-primary mb-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mako-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-mako-accent" />
          </span>
          System Online
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="text-mako-text">Welcome back, </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mako-accent via-mako-accent-warm to-mako-accent bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">
            Operator
          </span>
        </h1>

        
      </section>

      {/* ═══ 系统状态条 ═══ */}
      <section className="flex flex-wrap justify-center gap-3">
        <span className="mako-badge-default">Mako OS v1.4.0</span>
        <span className="mako-badge-default">Static Export</span>
        <span className="mako-badge-success">
          <span className="w-1.5 h-1.5 rounded-full bg-mako-success" />
          Supabase Auth
        </span>
        <span className="mako-badge-default">Local Cache</span>
        <span className="mako-badge-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-mako-accent" />
          Kernel Online
        </span>
      </section>

      {/* ═══ 四大空间入口卡片 ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {SPACE_CONFIGS.map((space) => {
          const style = SPACE_STYLES[space.id] || SPACE_STYLES.learning;

          return (
            <Link
              href={`/space/${space.id}`}
              key={space.id}
              className={`group relative flex flex-col p-8 mako-card overflow-hidden ${style.hoverGlow}`}
            >
              {/* 悬停背景光斑 */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 ${style.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-4">
                  {/* 图标 */}
                  <div className={`text-3xl w-14 h-14 rounded-2xl border flex items-center justify-center ${style.iconBg} ${style.iconBorder} transition-transform duration-500 group-hover:scale-110`}>
                    {space.icon}
                  </div>

                  {/* 标题与副标题 */}
                  <div>
                    <h2 className={`text-xl font-semibold tracking-wide ${style.text}`}>
                      {space.title}
                    </h2>
                    <p className="text-sm text-mako-text-secondary mt-1">{space.subtitle}</p>
                  </div>

                  {/* Motto */}
                  <p className="text-xs text-mako-text-muted italic leading-relaxed max-w-[240px]">
                    &ldquo;{space.motto}&rdquo;
                  </p>
                </div>

                {/* 箭头 */}
                <div className="w-10 h-10 rounded-full bg-white/50 border border-white/40 flex items-center justify-center text-mako-text-muted group-hover:bg-white/70 group-hover:border-white/60 transition-all duration-300">
                  <svg className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* 模块标签 */}
              <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-4 border-t border-black/5">
                {space.modules.map((mod) => (
                  <span key={mod} className="mako-badge-default text-[9px]">
                    {mod}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </section>

      {/* ═══ 底部情绪文案 ═══ */}
      <section className="text-center space-y-3 pb-8">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-black/10 to-transparent mx-auto" />
        <p className="text-sm text-mako-text-muted italic">
          Every signal has a meaning. Every silence is a choice.
        </p>
        <p className="text-[10px] text-mako-text-dim font-mono tracking-widest uppercase">
          — Frosted Canvas Protocol —
        </p>
      </section>
    </div>
  );
}
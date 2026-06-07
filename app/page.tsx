'use client';
import Link from 'next/link';

const SPACES = [
  { 
    id: 'learning', 
    title: 'Learning', 
    subtitle: 'Knowledge & Vocabulary', 
    icon: '🧠', 
    theme: 'text-blue-500',
    gradient: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/5',
    border: 'border-blue-500/20',
    hover: 'hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
  },
  { 
    id: 'work', 
    title: 'Work', 
    subtitle: 'Operations & Projects', 
    icon: '💼', 
    theme: 'text-indigo-500',
    gradient: 'from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/5',
    border: 'border-indigo-500/20',
    hover: 'hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]'
  },
  { 
    id: 'life', 
    title: 'Life', 
    subtitle: 'Biometrics & Daily', 
    icon: '🌿', 
    theme: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/5',
    border: 'border-emerald-500/20',
    hover: 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
  },
  { 
    id: 'entertainment', 
    title: 'Entertainment', 
    subtitle: 'Simulations & Games', 
    icon: '🎮', 
    theme: 'text-orange-500',
    gradient: 'from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/5',
    border: 'border-orange-500/20',
    hover: 'hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]'
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* 头部欢迎区 */}
      <div className="text-center space-y-4 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">Mako OS</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Select a workspace to initialize your session.</p>
      </div>

      {/* 4大板块 Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {SPACES.map((space) => (
          <Link 
            href={`/space/${space.id}`} 
            key={space.id}
            className={`group relative flex flex-col p-8 rounded-[2rem] bg-gradient-to-br ${space.gradient} border ${space.border} backdrop-blur-xl transition-all duration-500 ${space.hover} overflow-hidden`}
          >
            {/* 背景光晕动效 */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 dark:bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-4">
                <div className={`text-4xl ${space.theme} bg-white dark:bg-[#1C1C1E] w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm`}>
                  {space.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{space.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{space.subtitle}</p>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                <svg className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 底部系统状态 */}
      <div className="flex justify-center items-center space-x-2 text-xs text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>All systems operational</span>
      </div>
    </div>
  );
}
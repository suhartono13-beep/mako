'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CommandCheatSheet from './CommandCheatSheet'; 

export default function CommandCheatSheetPage() {
  const params = useParams();
  const router = useRouter();
  
  // 动态捕获当前空间名
  const domain = params?.domain as string || 'learning';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-8">
      {/* 顶部面包屑与返回导航 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
          <span>Mako OS</span>
          <span>/</span>
          <Link href={`/space/${domain}`} className="hover:text-blue-500 transition-colors uppercase">{domain}</Link>
          <span>/</span>
          <span className="text-slate-600">COMMANDS</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push(`/space/${domain}`)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Terminal Launchpad / 快捷指令舱</h1>
          </div>
          <span className="text-xs text-slate-400">点击卡片自动复制命令</span>
        </div>
      </div>

      {/* 主体容器直接渲染快捷键面板 */}
      <div className="max-w-4xl mx-auto">
        <CommandCheatSheet />
      </div>
    </div>
  );
}
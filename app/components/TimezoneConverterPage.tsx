'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TimezoneConverter from './TimezoneConverter'; 

export default function TimezoneConverterPage() {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain as string || 'life';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-8">
      {/* 顶部面包屑 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
          <span>Mako OS</span>
          <span>/</span>
          <Link href={`/space/${domain}`} className="hover:text-emerald-500 transition-colors uppercase">{domain}</Link>
          <span>/</span>
          <span className="text-slate-600">TIMEZONE</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push(`/space/${domain}`)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Time Sync / 时差换算矩阵</h1>
          </div>
        </div>
      </div>

      {/* 主体容器 */}
      <div className="max-w-4xl mx-auto">
        <TimezoneConverter />
      </div>
    </div>
  );
}
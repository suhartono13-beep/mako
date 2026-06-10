'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SYSTEM_MANIFEST } from '@/config/systemManifest';
import { toast } from 'sonner';

export default function SystemPage() {
  const [copied, setCopied] = useState(false);

 // 🌟 核心硬核功能：一键生成给新对话 AI 的初始化 prompt
  const generateAiPrompt = () => {
    const core = SYSTEM_MANIFEST.core;
    const constraintsStr = core.constraints.map(c => `- ${c}`).join('\n');
    const dataFlowStr = core.dataFlow?.map(d => `- ${d}`).join('\n') || '';
    const latestLogs = SYSTEM_MANIFEST.history.slice(0, 2).map(h => `-[${h.version}] ${h.title}:\n  ${h.changes.map(c => `  * ${c}`).join('\n')}`).join('\n');

    return `你好！我们要开始进行个人操作系统项目 **Mako OS** 的下一步开发。请严格基于以下设定回答后续问题：

### 1. 系统核心快照
- **当前版本**：${core.os}
- **技术栈**：${core.framework} + ${core.styling} + ${core.database}

### 2. 架构底线与限制【极度重要】
${constraintsStr}

### 3. 数据流策略
${dataFlowStr}

### 4. 目录结构拓扑图
\`\`\`text
${core.fileTree.trim()}
\`\`\`

### 5. 近期迭代日志
${latestLogs}

明确以上项目现状后，请回复：【Mako OS 意识上传成功，准备接收指令】。`;
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generateAiPrompt());
      setCopied(true);
      toast.success('AI 上下文已复制到剪贴板！');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败');
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'feat': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'fix': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-800 dark:text-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 顶部面包屑与标题 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Link href="/" className="hover:text-slate-600">Mako OS</Link>
              <span>/</span>
              <span className="text-slate-600 font-mono">SYSTEM_KERNEL</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Kernel Logs / 系统运行矩阵</h1>
          </div>

          {/* 🌟 极客一键复制按钮 */}
          <button
            onClick={handleCopyPrompt}
            className={`mt-4 md:mt-0 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm border transition-all flex items-center space-x-2 ${
              copied 
                ? 'bg-emerald-600 text-white border-emerald-700' 
                : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100'
            }`}
          >
            <span>{copied ? '✓ Context Copied' : '🤖 复制 AI 上下文宣言'}</span>
          </button>
        </div>

        {/* 核心配置卡片（当前状态快照） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">System Blueprint</h2>
            <div className="space-y-3 text-xs">
              <div><p className="text-slate-400">Core OS</p><p className="font-mono font-bold mt-0.5">{SYSTEM_MANIFEST.core.os}</p></div>
              <div><p className="text-slate-400">Codename</p><p className="font-semibold text-emerald-500 mt-0.5">{SYSTEM_MANIFEST.core.codename}</p></div>
              <div><p className="text-slate-400">Framework</p><p className="font-mono mt-0.5">{SYSTEM_MANIFEST.core.framework}</p></div>
              <div><p className="text-slate-400">Database</p><p className="font-mono mt-0.5">{SYSTEM_MANIFEST.core.database}</p></div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Kernel Structural Constraints</h2>
            <ul className="space-y-2">
              {SYSTEM_MANIFEST.core.constraints.map((c, i) => (
                <li key={i} className="text-xs flex items-start space-x-2 font-mono text-slate-600 dark:text-slate-400">
                  <span className="text-amber-500 select-none">⚠️</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 历史时间轴 */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Iteration Timeline ({SYSTEM_MANIFEST.history.length})</h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
            {SYSTEM_MANIFEST.history.map((log, index) => (
              <div key={index} className="relative group">
                {/* 时间轴小圆点 */}
                <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-[#f8fafc] dark:border-[#09090b] group-hover:bg-blue-500 transition-colors"></div>
                
                <div className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-bold tracking-tight text-slate-900 dark:text-white">{log.version}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono uppercase font-bold ${getTypeStyle(log.type)}`}>
                        {log.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{log.date}</span>
                  </div>

                  <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
                    {log.changes.map((change, i) => (
                      <li key={i} className="marker:text-slate-300">{change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
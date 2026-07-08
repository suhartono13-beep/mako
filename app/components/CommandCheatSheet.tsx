'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // 请确保路径正确
import { useAuth } from '@/hooks/useAuth';

// 扩展类型定义以适配 Supabase 数据
interface CommandDef {
  id?: string; // 来源于 DB，如果是新加的则为空
  cmd: string;
  desc: string;
}

interface CategoryGroup {
  category: string;
  commands: CommandDef[];
}

const DEFAULT_COMMAND_DATA: CategoryGroup[] = [
  {
    category: 'Git 版本控制',
    commands: [
      { cmd: 'git commit -m "feat: setup terminal launcher"', desc: '规范化提交新功能' },
      { cmd: 'git log --oneline --graph --all', desc: '可视化查看极简分支树' },
    ]
  }
];

export default function CommandCheatSheet() {
  const { session } = useAuth(); 
  const user = session?.user;
  
  // --- 状态管理 ---
  const [data, setData] = useState<CategoryGroup[]>([]);
  const [originalDbIds, setOriginalDbIds] = useState<string[]>([]); // 用于比对删除操作
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 从 Supabase 读取并重组树状结构
  const fetchCommands = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: dbData, error } = await supabase
        .from('mako_commands')
        .select('id, command, description, category');

      if (error) throw error;

      if (dbData && dbData.length > 0) {
        setOriginalDbIds(dbData.map(d => d.id));
        // 将扁平的 DB 数据还原为 Tabs 树状结构
        const grouped = dbData.reduce((acc: CategoryGroup[], curr) => {
          const cat = acc.find(c => c.category === curr.category);
          const cmdObj = { id: curr.id, cmd: curr.command, desc: curr.description };
          if (cat) {
            cat.commands.push(cmdObj);
          } else {
            acc.push({ category: curr.category, commands: [cmdObj] });
          }
          return acc;
        }, []);
        setData(grouped);
      } else {
        setData(DEFAULT_COMMAND_DATA);
      }
    } catch (error) {
      console.error('获取命令失败', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCommands();
  }, [fetchCommands]);

  // 2. 批量同步到 Supabase
  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      // a. 扁平化当前状态
      const flatCurrent = data.flatMap(tab => 
        tab.commands.map(c => ({
          id: c.id,
          user_id: user.id,
          category: tab.category,
          command: c.cmd,
          description: c.desc
        }))
      );

      const currentIds = flatCurrent.map(c => c.id).filter(Boolean) as string[];
      
      // b. 找出被删除的 ID 并在 DB 中擦除
      const deletedIds = originalDbIds.filter(id => !currentIds.includes(id));
      if (deletedIds.length > 0) {
        await supabase.from('mako_commands').delete().in('id', deletedIds);
      }

      // c. 整理需要 Upsert（新增或更新）的数据
      const toUpsert = flatCurrent.map(c => {
        const payload: any = { 
          user_id: c.user_id, 
          category: c.category, 
          command: c.command, 
          description: c.description 
        };
        if (c.id) payload.id = c.id; // 仅带上存在的 ID 供 Supabase 识别更新
        return payload;
      });

      if (toUpsert.length > 0) {
        await supabase.from('mako_commands').upsert(toUpsert);
      }

      // d. 重新拉取以获取最新的 DB IDs
      await fetchCommands();
      setIsEditing(false);
    } catch (error) {
      console.error('云端同步失败', error);
      alert('同步至云端失败，请检查网络');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 交互操作逻辑 ---
  const toggleEditMode = () => {
    if (isEditing) {
      handleSaveToCloud(); // 退出编辑时自动执行云端同步
    } else {
      setIsEditing(true);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    if (isEditing) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('复制失败: ', err);
    }
  };

  const updateCategoryName = (val: string) => {
    const newData = [...data];
    newData[activeTab].category = val;
    setData(newData);
  };

  const addCategory = () => {
    const newData = [...data, { category: 'New Category', commands: [] }];
    setData(newData);
    setActiveTab(newData.length - 1);
  };

  const deleteCategory = () => {
    if (data.length <= 1) return alert('至少保留一个分类！');
    if (confirm('确定要删除整个分类及其下属的所有命令吗？(将在点击完成时彻底删除)')) {
      const newData = data.filter((_, idx) => idx !== activeTab);
      setData(newData);
      setActiveTab(0);
    }
  };

  const updateCommand = (cmdIndex: number, field: 'cmd' | 'desc', val: string) => {
    const newData = [...data];
    newData[activeTab].commands[cmdIndex][field] = val;
    setData(newData);
  };

  const addCommand = () => {
    const newData = [...data];
    if (!newData[activeTab]) return;
    newData[activeTab].commands.push({ cmd: '', desc: '' });
    setData(newData);
  };

  const deleteCommand = (cmdIndex: number) => {
    const newData = [...data];
    newData[activeTab].commands.splice(cmdIndex, 1);
    setData(newData);
  };

  if (isLoading) {
    return (
      <div className="bg-white/30 backdrop-blur-md rounded-2xl p-12 text-center text-slate-600 animate-pulse border border-white/40">
        正在从 Mako 核心网络读取指令...
      </div>
    );
  }

  // --- 渲染 ---
  return (
    <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl shadow-xl p-6 relative overflow-hidden">
      
      {/* 顶部控制台：编辑开关 */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-widest text-sky-600 bg-sky-100/50 px-2 py-1 rounded-md border border-sky-200/50 shadow-sm">
          CLOUD SYNCED
        </span>
        <button
          onClick={toggleEditMode}
          disabled={isSaving}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all border shadow-sm disabled:opacity-50 ${
            isEditing 
              ? 'bg-sky-500 text-white border-sky-400 hover:bg-sky-600' 
              : 'bg-white/60 text-slate-600 border-white/60 hover:bg-white hover:text-slate-900'
          }`}
        >
          {isSaving ? '同步中...' : isEditing ? '✓ 完成编辑 (写入云端)' : '✏️ 编辑内核'}
        </button>
      </div>

      {/* Tab 选项卡区域 */}
      <div className="flex items-center space-x-2 border-b border-slate-300/50 pb-3 mb-6 overflow-x-auto pr-40 scrollbar-hide">
        {data.map((tab, idx) => (
          <div key={idx} className="flex items-center flex-shrink-0">
            {isEditing && activeTab === idx ? (
              <input
                type="text"
                value={tab.category}
                onChange={(e) => updateCategoryName(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-white/50 border-b-2 border-sky-500 outline-none w-28 text-slate-900 focus:bg-white/80 transition-all rounded-t-md"
              />
            ) : (
              <button
                onClick={() => { setActiveTab(idx); setCopiedIndex(null); }}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap shadow-sm border border-transparent ${
                  activeTab === idx
                    ? 'bg-white/80 text-sky-700 border-white/60 ring-1 ring-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {tab.category}
              </button>
            )}
          </div>
        ))}
        
        {/* 编辑模式下的分类操作按钮 */}
        {isEditing && (
          <div className="flex items-center space-x-1 pl-3 border-l border-white/50 ml-2">
            <button onClick={addCategory} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/40 text-slate-600 hover:bg-sky-100 hover:text-sky-600 shadow-sm transition-colors" title="新建分类">+</button>
            <button onClick={deleteCategory} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/40 text-slate-600 hover:bg-rose-100 hover:text-rose-600 shadow-sm transition-colors" title="删除当前分类">🗑</button>
          </div>
        )}
      </div>

      {/* 命令列表区域 */}
      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {(!data[activeTab] || data[activeTab].commands.length === 0) && (
          <div className="text-center py-8 text-sm text-slate-500 border border-dashed border-slate-300/60 bg-white/20 rounded-xl">
            此神经网络扇区暂无指令
          </div>
        )}

        {data[activeTab]?.commands.map((item, index) => (
          <div
            key={item.id || `new-${index}`}
            onClick={() => handleCopy(item.cmd, index)}
            className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl transition-all duration-200 border shadow-sm ${
              isEditing 
                ? 'bg-white/70 border-white/60' 
                : 'bg-white/40 hover:bg-white/80 border-white/50 hover:border-sky-200/50 cursor-pointer backdrop-blur-md'
            }`}
          >
            {/* 左侧内容区 */}
            <div className="flex items-start space-x-3 w-full pr-12">
              <span className={`font-mono select-none mt-1 font-bold ${isEditing ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-400 transition-colors'}`}>$</span>
              
              <div className="flex flex-col w-full space-y-2">
                {isEditing ? (
                  <>
                    <input 
                      type="text" 
                      value={item.cmd} 
                      onChange={(e) => updateCommand(index, 'cmd', e.target.value)}
                      className="text-xs font-mono text-slate-800 font-semibold w-full bg-white/50 border border-slate-200/50 rounded-md p-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all shadow-inner"
                      placeholder="输入代码命令..."
                    />
                    <input 
                      type="text" 
                      value={item.desc} 
                      onChange={(e) => updateCommand(index, 'desc', e.target.value)}
                      className="text-[11px] text-slate-600 w-full bg-transparent border-b border-dashed border-slate-300 p-1 outline-none focus:border-sky-400 transition-all"
                      placeholder="输入描述说明..."
                    />
                  </>
                ) : (
                  <>
                    <code className="text-xs font-mono text-slate-800 font-semibold break-all">
                      {item.cmd}
                    </code>
                    <span className="text-[11px] text-slate-500 mt-1 group-hover:text-slate-700 transition-colors">
                      {item.desc}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 右侧状态 / 操作区 */}
            <div className="absolute right-4 top-4 md:static text-xs font-medium flex-shrink-0">
              {isEditing ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteCommand(index); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                  title="删除此命令"
                >
                  ✕
                </button>
              ) : (
                copiedIndex === index ? (
                  <span className="text-sky-700 font-bold bg-sky-100/80 border border-sky-200 px-2 py-1 rounded-lg animate-pulse shadow-sm">✓ 已复制</span>
                ) : (
                  <span className="text-slate-500 opacity-0 group-hover:opacity-100 bg-white/80 border border-white px-2 py-1 rounded-lg transition-all shadow-sm backdrop-blur-md">
                    COPY
                  </span>
                )
              )}
            </div>
          </div>
        ))}

        {/* 编辑模式下的追加按钮 */}
        {isEditing && (
          <button 
            onClick={addCommand}
            className="mt-2 w-full py-3 border-2 border-dashed border-slate-300/60 bg-white/20 rounded-xl text-slate-500 text-xs font-semibold hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>+ 追加指令序列</span>
          </button>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';

// 默认初始数据（当用户本地没有缓存时加载）
const DEFAULT_COMMAND_DATA = [
  {
    category: 'Git 版本控制',
    commands: [
      { cmd: 'git commit -m "feat: setup terminal launcher"', desc: '规范化提交新功能' },
      { cmd: 'git log --oneline --graph --all', desc: '可视化查看极简分支树' },
    ]
  },
  {
    category: 'Supabase & Next.js',
    commands: [
      { cmd: 'npm run dev', desc: '启动 Next.js 本地开发服务器' },
    ]
  }
];

export default function CommandCheatSheet() {
  // --- 状态管理 ---
  const [data, setData] = useState(DEFAULT_COMMAND_DATA);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 1. 初始化时从本地缓存读取数据
  useEffect(() => {
    const savedData = localStorage.getItem('mako-commands-data');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('解析本地命令数据失败', e);
      }
    }
  }, []);

  // 2. 每次数据变动时，自动保存到本地缓存
  useEffect(() => {
    localStorage.setItem('mako-commands-data', JSON.stringify(data));
  }, [data]);

  // --- 操作逻辑 ---
  const handleCopy = async (text: string, index: number) => {
    if (isEditing) return; // 编辑模式下禁用复制
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('复制失败: ', err);
    }
  };

  // 修改分类名称
  const updateCategoryName = (val: string) => {
    const newData = [...data];
    newData[activeTab].category = val;
    setData(newData);
  };

  // 新增分类
  const addCategory = () => {
    const newData = [...data, { category: 'New Category', commands: [] }];
    setData(newData);
    setActiveTab(newData.length - 1);
  };

  // 删除当前分类
  const deleteCategory = () => {
    if (data.length <= 1) return alert('至少保留一个分类！');
    if (confirm('确定要删除整个分类及其下属的所有命令吗？')) {
      const newData = data.filter((_, idx) => idx !== activeTab);
      setData(newData);
      setActiveTab(0);
    }
  };

  // 修改具体命令
  const updateCommand = (cmdIndex: number, field: 'cmd' | 'desc', val: string) => {
    const newData = [...data];
    newData[activeTab].commands[cmdIndex][field] = val;
    setData(newData);
  };

  // 新增命令
  const addCommand = () => {
    const newData = [...data];
    newData[activeTab].commands.push({ cmd: 'new command', desc: '这里输入描述' });
    setData(newData);
  };

  // 删除具体命令
  const deleteCommand = (cmdIndex: number) => {
    const newData = [...data];
    newData[activeTab].commands.splice(cmdIndex, 1);
    setData(newData);
  };

  // --- 渲染 ---
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      
      {/* 顶部控制台：编辑开关 */}
      <div className="absolute top-4 right-6 z-10">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all border ${
            isEditing 
              ? 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          {isEditing ? '✓ 完成编辑 (自动保存)' : '✏️ 进入编辑模式'}
        </button>
      </div>

      {/* Tab 选项卡区域 */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-6 overflow-x-auto pr-32">
        {data.map((tab, idx) => (
          <div key={idx} className="flex items-center">
            {isEditing && activeTab === idx ? (
              <input
                type="text"
                value={tab.category}
                onChange={(e) => updateCategoryName(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 border-b-2 border-teal-500 outline-none w-28 text-slate-900"
              />
            ) : (
              <button
                onClick={() => { setActiveTab(idx); setCopiedIndex(null); }}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === idx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.category}
              </button>
            )}
          </div>
        ))}
        
        {/* 编辑模式下的分类操作按钮 */}
        {isEditing && (
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
            <button onClick={addCategory} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-600" title="新建分类">+</button>
            <button onClick={deleteCategory} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500" title="删除当前分类">🗑</button>
          </div>
        )}
      </div>

      {/* 命令列表区域 */}
      <div className="grid grid-cols-1 gap-3">
        {data[activeTab]?.commands.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
            当前分类下暂无命令
          </div>
        )}

        {data[activeTab]?.commands.map((item, index) => (
          <div
            key={index}
            onClick={() => handleCopy(item.cmd, index)}
            className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl transition-all duration-200 border ${
              isEditing ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 hover:bg-teal-50/50 border-slate-100 hover:border-teal-200 cursor-pointer'
            }`}
          >
            {/* 左侧内容区 */}
            <div className="flex items-start space-x-3 w-full pr-12">
              <span className={`font-mono select-none mt-1 ${isEditing ? 'text-teal-500' : 'text-slate-400'}`}>$</span>
              
              <div className="flex flex-col w-full space-y-2">
                {isEditing ? (
                  <>
                    <input 
                      type="text" 
                      value={item.cmd} 
                      onChange={(e) => updateCommand(index, 'cmd', e.target.value)}
                      className="text-xs font-mono text-slate-900 font-semibold w-full bg-slate-50 border border-slate-200 rounded p-1.5 outline-none focus:border-teal-400"
                      placeholder="输入代码命令..."
                    />
                    <input 
                      type="text" 
                      value={item.desc} 
                      onChange={(e) => updateCommand(index, 'desc', e.target.value)}
                      className="text-[11px] text-slate-500 w-full bg-transparent border-b border-dashed border-slate-200 p-1 outline-none focus:border-teal-400"
                      placeholder="输入描述说明..."
                    />
                  </>
                ) : (
                  <>
                    <code className="text-xs font-mono text-slate-900 font-semibold break-all">
                      {item.cmd}
                    </code>
                    <span className="text-[11px] text-slate-400 mt-1 group-hover:text-slate-600 transition-colors">
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  title="删除此命令"
                >
                  ✕
                </button>
              ) : (
                copiedIndex === index ? (
                  <span className="text-teal-600 font-bold bg-teal-100/60 px-2 py-1 rounded-md animate-pulse">✓ 已复制</span>
                ) : (
                  <span className="text-slate-400 opacity-0 group-hover:opacity-100 bg-white border border-slate-200 px-2 py-1 rounded-md transition-all shadow-sm">
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
            className="mt-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-semibold hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>+ 追加新命令</span>
          </button>
        )}
      </div>
    </div>
  );
}
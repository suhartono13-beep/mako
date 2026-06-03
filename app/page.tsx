'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Note {
  id: number;
  title: string;
  content: string;
  category: 'learning' | 'work' | 'life';
  inserted_at: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 当前选中的板块，默认为 'learning' (学习)
  const [activeTab, setActiveTab] = useState<'learning' | 'work' | 'life'>('learning');

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('inserted_at', { ascending: false });

      if (!error && data) {
        setNotes(data as Note[]);
      }
      setLoading(false);
    }
    fetchNotes();
  }, []);

  // 关键逻辑：过滤出符合当前分类的笔记
  const filteredNotes = notes.filter((note) => note.category === activeTab);

  // 定义分类的显示名称和图标
  const tabs = [
    { id: 'learning', name: '学习', icon: '📚' },
    { id: 'work', name: '工作', icon: '💼' },
    { id: 'life', name: '生活', icon: '🥤' },
  ] as const;

  if (loading) {
    return <div className="p-8 text-center text-slate-500">正在同步你的数字大脑...</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-6 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 text-center">Mako's Personal OS</h1>

      {/* 🧭 模块切换导航栏 */}
      <div className="flex space-x-2 mb-8 bg-slate-200 p-1.5 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* 📄 内容列表区域 */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white">
            <p className="text-slate-400">当前【{tabs.find(t => t.id === activeTab)?.name}】板块空空如也~</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="p-5 border border-slate-100 rounded-xl shadow-sm bg-white hover:shadow-md transition">
              <h2 className="text-xl font-bold text-slate-800 mb-2">{note.title}</h2>
              <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400">
                  ⏰ {new Date(note.inserted_at).toLocaleDateString()}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded">
                  {note.category.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
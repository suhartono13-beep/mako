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
  const [activeTab, setActiveTab] = useState<'learning' | 'work' | 'life'>('learning');

  // --- 📝 表单状态变量 ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'learning' | 'work' | 'life'>('learning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取数据
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

  // --- 🚀 处理表单提交 ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('标题和内容不能为空哦！');

    setIsSubmitting(true);

    // 将新笔记写入 Supabase
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content, category }])
      .select();

    setIsSubmitting(false);

    if (error) {
      alert('发布失败: ' + error.message);
    } else if (data) {
      // 成功后，将新数据塞到前端列表的最前面，实现无刷新实时更新
      setNotes([data[0] as Note, ...notes]);
      // 清空输入框
      setTitle('');
      setContent('');
      // 自动跳转到对应的标签页查看新内容
      setActiveTab(category);
    }
  }

  const filteredNotes = notes.filter((note) => note.category === activeTab);

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
      <h1 className="text-3xl font-bold mb-8 text-slate-800 text-center">Mako's Personal OS</h1>

      {/* 📝 快捷发布面板 */}
      <form onSubmit={handleSubmit} className="mb-10 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 flex items-center">
          <span className="mr-1.5">⚡</span> 随时随地，记点什么
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="输入标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-2 p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-800"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="learning">📚 学习</option>
            <option value="work">💼 工作</option>
            <option value="life">🥤 生活</option>
          </select>
        </div>

        <textarea
          placeholder="写下具体的灵感、任务或随笔..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-800"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:bg-blue-300"
        >
          {isSubmitting ? '正在发射到云端...' : '记录下来'}
        </button>
      </form>

      {/* 🧭 模块切换导航栏 */}
      <div className="flex space-x-2 mb-6 bg-slate-200 p-1.5 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <span className="mr-1">{tab.icon}</span> {tab.name}
          </button>
        ))}
      </div>

      {/* 📄 内容列表 */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white text-slate-400">
            当前板块还没有记录，在上方写一条吧！
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="p-5 border border-slate-100 rounded-xl shadow-sm bg-white">
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
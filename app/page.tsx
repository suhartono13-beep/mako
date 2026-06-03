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
  // --- 🔒 登录状态管理 ---
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- 📝 笔记数据与表单状态 ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'learning' | 'work' | 'life'>('learning');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'learning' | 'work' | 'life'>('learning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 监听并检查用户的登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 当用户已登录时，才去拉取数据库内容
  useEffect(() => {
    if (!session) return;

    async function fetchNotes() {
      setLoading(true);
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
  }, [session]);

  // --- 🚀 处理登录 ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) alert('登录失败: ' + error.message);
  }

  // --- 🚪 处理退出登录 ---
  async function handleLogout() {
    await supabase.auth.signOut();
    setNotes([]); // 清空前端数据
  }

  // --- ➕ 处理发布笔记 ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('标题和内容不能为空！');

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content, category }])
      .select();

    setIsSubmitting(false);

    if (error) {
      alert('发布失败: ' + error.message);
    } else if (data) {
      setNotes([data[0] as Note, ...notes]);
      setTitle('');
      setContent('');
      setActiveTab(category);
    }
  }

  // --- 🗑️ 处理删除笔记 ---
  async function handleDelete(id: number) {
    if (!confirm('确定要删除这条记录吗？')) return;

    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      alert('删除失败: ' + error.message);
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  }

  // --- 🚪 视图拦截：如果未登录，直接显示登录界面 ---
  if (!session) {
    return (
      <main className="max-w-md mx-auto p-6 min-h-screen flex flex-col justify-center bg-slate-50">
        <div className="bg-white p-8 border border-slate-100 rounded-2xl shadow-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Mako's Personal OS</h1>
            <p className="text-xs text-slate-400 mt-1">🔒 私人空间，请输入管理员凭证访问</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">管理员邮箱</label>
              <input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">访问密码</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-800"
                required
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:bg-slate-400"
            >
              {authLoading ? '正在验证安全凭证...' : '安全登录'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- 🔓 以下为登录成功后才会展示的数字大脑界面 ---
  const filteredNotes = notes.filter((note) => note.category === activeTab);
  const tabs = [
    { id: 'learning', name: '学习', icon: '📚' },
    { id: 'work', name: '工作', icon: '💼' },
    { id: 'life', name: '生活', icon: '🥤' },
  ] as const;

  return (
    <main className="max-w-2xl mx-auto p-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mako's Personal OS</h1>
          <p className="text-xs text-green-500 flex items-center mt-0.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            已建立加密安全连接
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl transition shadow-sm"
        >
          退出系统 🚪
        </button>
      </div>

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
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:bg-blue-300"
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
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">正在解密并加载数据...</div>
      ) : (
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition px-2 py-0.5 rounded hover:bg-red-50"
                    >
                      删除
                    </button>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded">
                      {note.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
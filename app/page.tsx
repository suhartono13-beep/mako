'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. 🎯 定义全局的板块类型，新增 'entertainment'
type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';

interface Note {
  id: number;
  title: string;
  content: string;
  category: AppCategory;
  inserted_at: string;
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. 🎯 将状态类型更新为 AppCategory
  const [activeTab, setActiveTab] = useState<AppCategory>('learning');
  const [searchQuery, setSearchQuery] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AppCategory>('learning');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('图片太胖了！请上传小于 5MB 的图片');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('note-images')
        .getPublicUrl(fileName);

      setContent((prev) => prev + `\n![图片描述](${publicUrl})\n`);
    } catch (error: any) {
      alert('图片上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) alert('登录失败: ' + error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setNotes([]);
  }

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

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这条记录吗？')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      alert('删除失败: ' + error.message);
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  }

  if (!session) {
    // ... 登录界面保持不变 ...
    return (
      <main className="max-w-md mx-auto p-6 min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mako's Personal OS</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">🔒 私人空间，请输入管理员凭证访问</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">管理员邮箱</label>
              <input type="email" placeholder="your-email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">访问密码</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100" required />
            </div>
            <button type="submit" disabled={authLoading} className="w-full py-2.5 bg-slate-800 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50">
              {authLoading ? '正在验证安全凭证...' : '安全登录'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const filteredNotes = notes.filter((note) => {
    const matchesTab = note.category === activeTab;
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // 3. 🎯 拓展 4 大板块标签
  const tabs: { id: AppCategory; name: string; icon: string }[] = [
    { id: 'learning', name: '学习', icon: '📚' },
    { id: 'work', name: '工作', icon: '💼' },
    { id: 'life', name: '生活', icon: '🥤' },
    { id: 'entertainment', name: '娱乐', icon: '🎮' },
  ];

  // 4. 🎯 新增：为未来预留的“专属工具箱”数据结构
  // 以后你可以把这里的 URL 换成真实的网站，或者直接在这里嵌入小工具组件
  const tabWidgets: Record<AppCategory, { name: string, icon: string, url: string }[]> = {
    learning: [
      { name: 'GitHub', icon: '🐙', url: 'https://github.com' },
      { name: '在线翻译', icon: '🌐', url: 'https://translate.google.com' },
    ],
    work: [
      { name: '邮箱', icon: '📧', url: '#' },
      { name: '日程表', icon: '📅', url: '#' },
    ],
    life: [
      { name: '记账本', icon: '💰', url: '#' },
      { name: '天气预报', icon: '⛅', url: '#' },
    ],
    entertainment: [
      { name: 'YouTube', icon: '📺', url: 'https://youtube.com' },
      { name: '豆瓣电影', icon: '🎬', url: 'https://movie.douban.com' },
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <main className="max-w-2xl mx-auto p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8 border-b dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mako's Personal OS</h1>
            <p className="text-xs text-green-500 flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              已建立加密安全连接
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleDarkMode} className="text-lg p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm" title="切换暗黑模式">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-2 rounded-xl transition shadow-sm">
              退出系统 🚪
            </button>
          </div>
        </div>

        {/* 📝 快捷发布面板 */}
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center">
              <span className="mr-1.5">💡</span> 新增记录
            </h3>
            
            <label className={`text-xs flex items-center space-x-1 px-2.5 py-1.5 border rounded-xl cursor-pointer shadow-sm transition ${uploading ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}>
              <span>{uploading ? '⚡ 正在上传...' : '🖼️ 插入图片'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="输入标题..." value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-2 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100" />
            {/* 5. 🎯 表单下拉菜单中加入“娱乐” */}
            <select value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-700 dark:text-slate-200">
              <option value="learning">📚 学习</option>
              <option value="work">💼 工作</option>
              <option value="life">🥤 生活</option>
              <option value="entertainment">🎮 娱乐</option>
            </select>
          </div>

          <textarea placeholder="可以用 # 标题、**加粗** 记录。也可以点击右上角直接插图！" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100 font-mono" />

          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50">
            {isSubmitting ? '正在同步到云端...' : '记录下来'}
          </button>
        </form>

        {/* 🧭 模块切换导航栏 */}
        <div className="flex space-x-2 mb-6 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-xl transition-colors">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="mr-1">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </div>

        {/* 6. 🎯 新增：各板块专属的【快捷工具箱】视图 */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">
            {tabs.find(t => t.id === activeTab)?.name} 快捷面板
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {tabWidgets[activeTab].map((widget, idx) => (
              <a 
                key={idx} 
                href={widget.url} 
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md dark:hover:border-slate-700 transition group cursor-pointer"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{widget.icon}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{widget.name}</span>
              </a>
            ))}
            {/* 添加一个占位的“添加工具”按钮，暗示以后可以拓展 */}
            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer text-slate-400 dark:text-slate-500">
              <span className="text-xl mb-1">+</span>
              <span className="text-[10px] font-medium">添加工具</span>
            </div>
          </div>
        </div>

        {/* 🔍 全局智能搜索框 */}
        <div className="mb-6 relative">
          <input type="text" placeholder="🔍 搜寻记忆..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-md transition shadow-sm" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 px-2 py-0.5 rounded-md">清空</button>
          )}
        </div>

        {/* 📄 内容列表 */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">正在加载安全数据...</div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-sm transition-colors">
                {searchQuery ? '🎯 没有找到匹配该关键词的记录' : '当前板块还没有记录，在上方写一条吧！'}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="p-5 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 transition-colors">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{note.title}</h2>
                  
                  <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed prose max-w-none 
                    prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:mt-2 prose-headings:mb-1
                    prose-strong:text-slate-900 dark:prose-strong:text-slate-200 prose-strong:font-bold
                    prose-a:text-blue-600 dark:prose-a:text-blue-400
                    prose-img:rounded-xl prose-img:shadow-sm prose-img:max-h-80 prose-img:object-cover prose-img:my-3
                    prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-red-500 dark:prose-code:text-red-400 prose-code:font-mono prose-code:text-xs
                    prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:block prose-pre:font-mono prose-pre:text-xs prose-pre:my-2 prose-pre:overflow-x-auto">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ⏰ {new Date(note.inserted_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        删除
                      </button>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
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
    </div>
  );
}
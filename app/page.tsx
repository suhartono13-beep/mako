'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      alert('图片尺寸过大，限制 5MB 以内。');
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

      setContent((prev) => prev + `\n![Image](${publicUrl})\n`);
    } catch (error: any) {
      alert('上传失败: ' + error.message);
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
    if (!title.trim() || !content.trim()) return alert('数据流不完整，请填写标题与内容。');

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content, category }])
      .select();

    setIsSubmitting(false);

    if (error) {
      alert('同步失败: ' + error.message);
    } else if (data) {
      setNotes([data[0] as Note, ...notes]);
      setTitle('');
      setContent('');
      setActiveTab(category);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('警告：此操作不可逆，确认删除该区块？')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      alert('删除失败: ' + error.message);
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  }

  // --- 登录界面（极客/未来感重构） ---
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-[#09090b] transition-colors duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-[#09090b] dark:to-black">
        <div className="w-full max-w-md p-8 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
              Mako's Neural Net
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono uppercase tracking-widest">
              System Authorization Required
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input type="email" placeholder="Identity (Email)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all" required />
            </div>
            <div>
              <input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all" required />
            </div>
            <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50">
              {authLoading ? 'Authenticating...' : 'INITIALIZE CONNECTION'}
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

  const tabs: { id: AppCategory; name: string; icon: string }[] = [
    { id: 'learning', name: 'Knowledge', icon: '🧠' },
    { id: 'work', name: 'Operations', icon: '⚡' },
    { id: 'life', name: 'Biometrics', icon: '🧬' },
    { id: 'entertainment', name: 'Simulations', icon: '🎮' },
  ];

  const tabWidgets: Record<AppCategory, { name: string, icon: string, url: string }[]> = {
    learning: [
      { name: 'GitHub', icon: '🐙', url: 'https://github.com' },
      { name: 'Translator', icon: '🌐', url: 'https://translate.google.com' },
    ],
    work: [
      { name: 'Comm Link', icon: '📧', url: '#' },
      { name: 'Timeline', icon: '📅', url: '#' },
    ],
    life: [
      { name: 'Ledger', icon: '💳', url: '#' },
      { name: 'Atmosphere', icon: '⛅', url: '#' },
    ],
    entertainment: [
      { name: 'Holodeck', icon: '📺', url: 'https://youtube.com' },
      { name: 'Cinema', icon: '🎬', url: 'https://movie.douban.com' },
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] transition-colors duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-[#09090b] dark:to-black">
      
      {/* 🔮 顶部悬浮导航栏 (Glassmorphism Sticky Nav) */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#09090b]/70 border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-sm">OS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Personal OS</h1>
              <div className="flex items-center mt-0.5 space-x-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <span className="text-[10px] text-emerald-500/80 dark:text-emerald-400/80 font-mono uppercase tracking-wider">Sys Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform shadow-sm">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="text-xs font-semibold bg-slate-800 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full hover:opacity-80 transition-opacity shadow-md">
              Disconnect
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 mt-4 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 📝 左侧/顶部面板：智能输入终端 */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="p-6 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-cyan-400 transition-colors"></div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center">
                  <span className="mr-2 text-indigo-500">◆</span> New Block
                </h3>
                <label className={`text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all ${uploading ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}`}>
                  <span>{uploading ? 'Processing...' : 'Attach Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <input type="text" placeholder="Block Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-4 py-2.5 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 text-lg font-semibold focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 text-slate-800 dark:text-slate-100 transition-colors placeholder-slate-300 dark:placeholder-slate-700" />
                  <select value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} className="w-1/3 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-300 font-medium">
                    {tabs.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <textarea placeholder="Initialize data stream... (Markdown supported)" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100 font-mono resize-none placeholder-slate-400 dark:placeholder-slate-600" />
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-50">
                  {isSubmitting ? 'Syncing...' : 'COMMIT BLOCK'}
                </button>
              </div>
            </form>
          </div>

          {/* 🎛️ 右侧：Bento Box 风格的工具面板 */}
          <div className="space-y-6">
             {/* 搜索舱 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 group-focus-within:text-indigo-500 transition-colors">⌕</span>
              </div>
              <input type="text" placeholder="Query DB..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100 transition-all shadow-sm font-mono" />
            </div>

            {/* 动态工具模块 */}
            <div className="p-5 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest font-mono">
                Active Modules: {activeTab}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {tabWidgets[activeTab].map((widget, idx) => (
                  <a key={idx} href={widget.url} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-slate-50 dark:bg-black/30 border border-slate-200/50 dark:border-white/5 rounded-2xl hover:border-indigo-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
                    <span className="text-lg mr-3 group-hover:scale-110 transition-transform">{widget.icon}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{widget.name}</span>
                  </a>
                ))}
                <div className="flex items-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer text-slate-400">
                  <span className="text-lg mr-3 opacity-50">+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">Install</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🧭 分类导航 (Segmented Control 风格) */}
        <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="mr-1.5 opacity-80">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </div>

        {/* 📄 数据流展示 (瀑布流/网格样式适应) */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm text-slate-500 font-mono">Fetching data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/30 dark:bg-white/[0.01] text-slate-400 dark:text-slate-500 text-sm font-mono">
                {searchQuery ? '> 0 records found.' : '> Database empty. Awaiting input.'}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="group p-6 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                      {note.title}
                    </h2>
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-wider">
                      {note.category}
                    </span>
                  </div>
                  
                  <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed prose prose-slate dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-a:text-indigo-500 hover:prose-a:text-indigo-400
                    prose-img:rounded-2xl prose-img:shadow-md prose-img:border prose-img:border-slate-200/50 dark:prose-img:border-white/10
                    prose-code:bg-slate-100 dark:prose-code:bg-black/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-cyan-600 dark:prose-code:text-cyan-400 prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-slate-900 dark:prose-pre:bg-black/80 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-2xl">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center">
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mr-2"></span>
                      {new Date(note.inserted_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs font-bold text-red-500 hover:text-red-400 transition-all px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20"
                    >
                      DELETE
                    </button>
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
'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/app/layout';

type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';

interface Note {
  id: number;
  title: string;
  content: string;
  category: AppCategory;
  inserted_at: string;
}

export default function Matrix() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppCategory>('learning');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedWords, setRevealedWords] = useState<number[]>([]);

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('inserted_at', { ascending: false });

      if (!error && data) setNotes(data as Note[]);
      setLoading(false);
    }
    fetchNotes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('警告：确认删除该区块？')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) alert('删除失败: ' + error.message);
    else setNotes(notes.filter(note => note.id !== id));
  };

  const toggleRevealWord = (id: number) => {
    if (revealedWords.includes(id)) {
      setRevealedWords(revealedWords.filter(item => item !== id));
    } else {
      setRevealedWords([...revealedWords, id]);
    }
  };

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
      { name: 'DeepL Trans', icon: '🌐', url: 'https://www.deepl.com' },
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
    <div className="space-y-8 animate-fade-in">
      {/* 搜索栏与 Bento 挂件区 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">⌕</span>
          <input type="text" placeholder="Query Matrix Database..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100 font-mono shadow-sm" />
        </div>

        <div className="p-4 bg-white/60 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {tabWidgets[activeTab].map((widget, idx) => (
              <a key={idx} href={widget.url} target="_blank" rel="noreferrer" className="flex items-center p-2.5 bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 rounded-xl hover:border-indigo-400 transition-all text-xs font-bold">
                <span className="mr-2 text-base">{widget.icon}</span> {widget.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 🧭 宽距分类导航栏 */}
      <div className="flex p-1.5 bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md scale-[1.01]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
            <span className="mr-1.5 opacity-80">{tab.icon}</span> {tab.name}
          </button>
        ))}
      </div>

      {/* 📄 记忆卡片流 */}
      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-sm text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          Fetching Data Matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/10 text-slate-400 font-mono text-sm">
              &gt; {searchQuery ? '0 records found in current node.' : 'Database empty. Awaiting input terminal connection.'}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isWordCard = note.title.startsWith('🔤 ');
              const cleanTitle = isWordCard ? note.title.replace('🔤 ', '') : note.title;
              const isRevealed = revealedWords.includes(note.id);

              return (
                <div key={note.id} className={`group p-8 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 ${isWordCard ? 'hover:border-purple-500/40 border-l-4 border-l-purple-500/70' : 'hover:border-indigo-500/30'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-extrabold tracking-tight flex items-center">
                      {cleanTitle}
                      {isWordCard && <span className="ml-3 text-[9px] font-mono px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded uppercase tracking-widest">Vocab Card</span>}
                    </h2>
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg uppercase tracking-wider">{note.category}</span>
                  </div>
                  
                  {isWordCard ? (
                    <div onClick={() => toggleRevealWord(note.id)} className={`cursor-pointer p-5 rounded-2xl border transition-all ${isRevealed ? 'bg-slate-50/50 dark:bg-black/10 border-slate-100 dark:border-white/5' : 'bg-purple-500/[0.01] border-purple-500/10 hover:bg-purple-500/[0.03]'}`}>
                      <div className={`transition-all duration-300 text-sm leading-relaxed prose dark:prose-invert max-w-none ${isRevealed ? 'blur-0 opacity-100' : 'blur-md opacity-30 select-none'}`}>
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                      {!isRevealed && <div className="text-center py-1 text-xs font-mono font-bold text-purple-500/80 animate-pulse tracking-wider">⚡ CLICK TO DECRYPT MEANING ⚡</div>}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed prose dark:prose-invert max-w-none prose-img:rounded-2xl prose-code:text-cyan-500 prose-code:font-mono prose-code:text-xs">
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center">
                      <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mr-2"></span>
                      {new Date(note.inserted_at).toLocaleString()}
                    </span>
                    <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 text-xs font-bold text-red-500 hover:text-red-400 transition-all px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10">DELETE</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
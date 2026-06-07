'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/app/layout';
import { toast } from 'sonner';
import Link from 'next/link';

type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';
type ActiveTab = 'all' | AppCategory;

interface Note {
  id: number;
  title: string;
  content: string;
  category: AppCategory;
  created_at: string; // 兼容新的时间戳字段
}

export default function Galaxy() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all'); // ✨ 默认全域模式
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [revealedWords, setRevealedWords] = useState<number[]>([]);

  // 每次切换 Tab 时，重置加载数量，防止溢出
  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab]);

  // 1. 获取全域数据
  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false }); // 确保对应你的数据库字段
      
      if (!error && data) setNotes(data as Note[]);
      setLoading(false);
    }
    fetchNotes();
  }, []);

  // ✨ 防抖逻辑：停止输入 300ms 后，再更新实际用于过滤的查询词
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(10);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 带确认的删除功能
  const handleDelete = (id: number) => {
    toast('Delete this block?', {
      description: 'This action cannot be undone and will be erased from the OS.',
      action: {
        label: 'Delete',
        onClick: async () => {
          const { error } = await supabase.from('notes').delete().eq('id', id);
          if (error) {
            toast.error('Delete failed', { description: error.message });
          } else {
            setNotes((prev) => prev.filter((note) => note.id !== id));
            toast.success('Block deleted from matrix');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => console.log('Delete cancelled'),
      },
    });
  };

  // 单词卡解密
  const toggleRevealWord = (id: number) => {
    if (revealedWords.includes(id)) setRevealedWords(revealedWords.filter(item => item !== id));
    else setRevealedWords([...revealedWords, id]);
  };

  // 🛠️ 核心融合：全域过滤与防抖搜索
  const filteredNotes = notes.filter((note) => {
    const matchesTab = activeTab === 'all' || note.category === activeTab;
    const matchesSearch = (note.title && note.title.toLowerCase().includes(debouncedQuery.toLowerCase())) || 
                          (note.content && note.content.toLowerCase().includes(debouncedQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const visibleNotes = filteredNotes.slice(0, visibleCount);

  // 融合了 All 选项的 Segmented Control
  const tabs: { id: ActiveTab; name: string }[] = [
    { id: 'all', name: '🌌 Omni (All)' },
    { id: 'learning', name: 'Knowledge' },
    { id: 'work', name: 'Operations' },
    { id: 'life', name: 'Biometrics' },
    { id: 'entertainment', name: 'Simulations' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10 pb-20 pt-4">
      
      {/* 头部导航与标题 */}
      <div className="space-y-2">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          ← Return to Dashboard
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Omni-Search Galaxy</h1>
      </div>

      {/* 极简搜索与 Apple 风格导航 */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">⌕</span>
          <input 
            type="text" 
            placeholder="Search across dimensions..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-xl border border-white/40 dark:border-white/[0.05] rounded-2xl text-sm focus:outline-none focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 shadow-sm transition-all" 
          />
        </div>

        {/* Apple 风格 Segmented Control */}
        <div className="flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-xl rounded-xl overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-shrink-0 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-white/90 dark:bg-[#1C1C1E]/90 text-black dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* 数据流卡片：应用毛玻璃 */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-sm text-gray-400 animate-pulse">
          Scanning coordinates...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pt-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-md rounded-3xl border border-dashed border-black/10 dark:border-white/10">
              No records match your frequency.
            </div>
          ) : (
            visibleNotes.map((note) => {
              // 兼容新旧版本的单词卡片标记
              const isWordCard = note.title.startsWith('🔤 ') || note.title.startsWith('[Word]');
              const cleanTitle = note.title.replace('🔤 ', '').replace('[Word] ', '');
              const isRevealed = revealedWords.includes(note.id);

              return (
                <div key={note.id} className="group p-6 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/40 dark:border-white/[0.05] rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
                  {isWordCard && <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500/80"></div>}
                  
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold tracking-tight">{cleanTitle}</h2>
                    {/* 显示所属空间标签，便于全域浏览时辨认 */}
                    {activeTab === 'all' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
                        {note.category}
                      </span>
                    )}
                  </div>
                  
                  {isWordCard ? (
                    <div onClick={() => toggleRevealWord(note.id)} className={`cursor-pointer p-4 rounded-xl backdrop-blur-md transition-all border border-white/20 dark:border-white/5 ${isRevealed ? 'bg-black/[0.02] dark:bg-white/[0.02]' : 'bg-blue-500/5'}`}>
                      <div className={`text-sm leading-relaxed prose dark:prose-invert max-w-none transition-all duration-300 ${isRevealed ? 'blur-0 opacity-100' : 'blur-md opacity-30 select-none'}`}>
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                      {!isRevealed && <div className="text-center mt-2 text-xs font-medium text-blue-500">Tap to reveal</div>}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none prose-img:rounded-xl">
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 text-xs font-medium text-red-500 hover:text-red-600 transition-opacity">
                      Delete Block
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 加载更多按钮 */}
      {!loading && visibleCount < filteredNotes.length && (
        <div className="flex justify-center mt-8 pb-8 animate-fade-in">
          <button 
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-6 py-2.5 bg-white/60 dark:bg-[#1C1C1E]/60 text-gray-800 dark:text-gray-200 border border-white/40 dark:border-white/[0.05] hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-sm font-medium transition-all backdrop-blur-md shadow-sm"
          >
            Load More Archives ↓
          </button>
        </div>
      )}
    </div>
  );
}
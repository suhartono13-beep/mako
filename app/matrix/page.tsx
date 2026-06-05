'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/app/layout';
import { toast } from 'sonner';

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
      const { data, error } = await supabase.from('notes').select('*').order('inserted_at', { ascending: false });
      if (!error && data) setNotes(data as Note[]);
      setLoading(false);
    }
    fetchNotes();
  }, []);

  const handleDelete = (id: number) => {
    toast('Delete this block?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          const { error } = await supabase.from('notes').delete().eq('id', id);
          if (error) {
            toast.error('Delete failed', { description: error.message });
          } else {
            setNotes((prev) => prev.filter((note) => note.id !== id));
            toast.success('Block deleted');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => console.log('Delete cancelled'),
      },
    });
  };

  const toggleRevealWord = (id: number) => {
    if (revealedWords.includes(id)) setRevealedWords(revealedWords.filter(item => item !== id));
    else setRevealedWords([...revealedWords, id]);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesTab = note.category === activeTab;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs: { id: AppCategory; name: string }[] = [
    { id: 'learning', name: 'Knowledge' },
    { id: 'work', name: 'Operations' },
    { id: 'life', name: 'Biometrics' },
    { id: 'entertainment', name: 'Simulations' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative z-10">
      
      {/* ✨ 极简搜索与导航：应用毛玻璃 ✨ */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">⌕</span>
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-xl border border-white/40 dark:border-white/[0.05] rounded-2xl text-sm focus:outline-none focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all" />
        </div>

        {/* Apple 风格 Segmented Control */}
        <div className="flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-xl rounded-xl">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-white/90 dark:bg-[#1C1C1E]/90 text-black dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'}`}>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* ✨ 数据流卡片：应用毛玻璃 ✨ */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-sm text-gray-400">
          Loading Data...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pt-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-md rounded-3xl border border-dashed border-black/10 dark:border-white/10">
              No records found.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isWordCard = note.title.startsWith('🔤 ');
              const cleanTitle = isWordCard ? note.title.replace('🔤 ', '') : note.title;
              const isRevealed = revealedWords.includes(note.id);

              return (
                <div key={note.id} className="group p-6 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/40 dark:border-white/[0.05] rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
                  {isWordCard && <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500/80"></div>}
                  
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold tracking-tight">{cleanTitle}</h2>
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
                      {new Date(note.inserted_at).toLocaleDateString()}
                    </span>
                    <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 text-xs font-medium text-red-500 hover:text-red-600 transition-opacity">
                      Delete
                    </button>
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
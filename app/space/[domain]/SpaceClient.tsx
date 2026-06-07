'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; //  修改为这一行
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  inserted_at: string; // 👈 已修正
}

const SPACE_CONFIGS: Record<string, { title: string; icon: string; bg: string; text: string; border: string; btn: string }> = {
  learning: { title: 'Knowledge Space', icon: '🧠', bg: 'bg-blue-500/5', text: 'text-blue-500', border: 'border-blue-500/20', btn: 'bg-blue-600 hover:bg-blue-700' },
  work: { title: 'Operations Center', icon: '💼', bg: 'bg-indigo-500/5', text: 'text-indigo-500', border: 'border-indigo-500/20', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  life: { title: 'Biometrics Log', icon: '🌿', bg: 'bg-emerald-500/5', text: 'text-emerald-500', border: 'border-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  entertainment: { title: 'Simulation Matrix', icon: '🎮', bg: 'bg-orange-500/5', text: 'text-orange-500', border: 'border-orange-500/20', btn: 'bg-orange-600 hover:bg-orange-700' },
};

export default function SpaceClient({ domain }: { domain: string }) {
  const router = useRouter();
  const config = SPACE_CONFIGS[domain] || SPACE_CONFIGS.learning;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [revealedWords, setRevealedWords] = useState<number[]>([]);

  const fetchSpaceNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('category', domain)
        .order('inserted_at', { ascending: false }); // 👈 已修正

      if (error) throw error;
      setNotes((data as Note[]) || []);
    } catch (err: any) {
      console.error(err);
      toast.error('数据同步失败，无法加载空间阻尼');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!domain) return;
    fetchSpaceNotes();
  }, [domain]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(10);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = (id: number) => {
    toast('Delete this block?', {
      description: 'This action cannot be undone and will be erased from this Space.',
      action: {
        label: 'Delete',
        onClick: async () => {
          const { error } = await supabase.from('notes').delete().eq('id', id);
          if (error) {
            toast.error('Delete failed', { description: error.message });
          } else {
            setNotes((prev) => prev.filter((note) => note.id !== id));
            toast.success('Block permanently deleted');
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
    return (
      (note.title && note.title.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
      (note.content && note.content.toLowerCase().includes(debouncedQuery.toLowerCase()))
    );
  });

  const visibleNotes = filteredNotes.slice(0, visibleCount);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-6">
        <div className="flex items-center space-x-4">
          <div className={`text-4xl bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border ${config.border} shadow-sm`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Mako OS</Link>
              <span className="text-xs text-gray-300">/</span>
              <span className={`text-xs font-semibold ${config.text} uppercase tracking-wider`}>{domain}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1 text-gray-950 dark:text-white">{config.title}</h1>
          </div>
        </div>

        <Link 
          href={`/galaxy`} 
          className="mt-4 md:mt-0 px-4 py-2 text-xs font-medium rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center space-x-1"
        >
          <span>🌌 打开全域知识星系</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
        <input 
          type="text" 
          placeholder={`Filter inside ${config.title}...`} 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full pl-9 pr-4 py-2.5 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 shadow-sm transition-all" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Terminal Launchpad</h2>
          <div className={`p-6 bg-white/50 dark:bg-[#1C1C1E]/50 backdrop-blur-xl border ${config.border} rounded-[2rem] space-y-4 shadow-sm`}>
            
            <button 
              onClick={() => router.push(`/terminal?category=${domain}`)}
              className={`w-full py-4 ${config.bg} ${config.text} border ${config.border} hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-sm font-semibold shadow-sm transition-all flex flex-col items-center justify-center space-y-1`}
            >
              <span className="text-xl">⚡️</span>
              <span>Initialize Standard Block</span>
            </button>

            {domain === 'learning' && (
              <button 
                onClick={() => router.push(`/terminal?category=learning&mode=word`)}
                className={`w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold shadow-md hover:scale-[1.02] transition-transform flex flex-col items-center justify-center space-y-1`}
              >
                <span className="text-xl">🔤</span>
                <span>Vocabulary Entry Mode</span>
              </button>
            )}

            <div className="pt-4 border-t border-black/5 dark:border-white/5 text-center">
              <p className="text-[10px] text-gray-400">
                Data blocks will be strictly routed to <span className="font-bold uppercase">{domain}</span> matrix.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Space Blocks ({filteredNotes.length})</h2>
          
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-400 animate-pulse">正在同步空间流场...</div>
          ) : filteredNotes.length === 0 ? (
            <div className={`p-12 text-center border ${config.border} rounded-[2rem] bg-white/20 dark:bg-white/[0.01]`}>
              <p className="text-sm text-gray-400">当前过滤条件下空无一物。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visibleNotes.map((note) => {
                const isWordCard = note.title.startsWith('🔤 ') || note.title.startsWith('[Word]');
                const cleanTitle = note.title.replace('🔤 ', '').replace('[Word] ', '');
                const isRevealed = revealedWords.includes(note.id);

                return (
                  <div 
                    key={note.id}
                    className="group p-6 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border border-black/[0.04] dark:border-white/[0.04] rounded-2xl hover:shadow-md transition-all relative overflow-hidden"
                  >
                    {isWordCard && <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500/80"></div>}
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 
                        onClick={() => router.push(`/terminal?id=${note.id}`)}
                        className="font-bold text-lg text-gray-900 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors cursor-pointer tracking-tight"
                      >
                        {cleanTitle} <span className="text-xs font-normal text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1">✏️ Edit</span>
                      </h3>
                    </div>
                    
                    {isWordCard ? (
                      <div 
                        onClick={() => toggleRevealWord(note.id)} 
                        className={`cursor-pointer p-4 rounded-xl backdrop-blur-md transition-all border border-white/20 dark:border-white/5 ${isRevealed ? 'bg-black/[0.02] dark:bg-white/[0.02]' : 'bg-blue-500/5'}`}
                      >
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
                    
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/[0.03] dark:border-white/[0.03]">
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(note.inserted_at).toLocaleDateString()} {/* 👈 已修正 */}
                      </span>
                      <button 
                        onClick={() => handleDelete(note.id)} 
                        className="opacity-0 group-hover:opacity-100 text-xs font-medium text-red-500 hover:text-red-600 transition-opacity"
                      >
                        Delete Block
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visibleCount < filteredNotes.length && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="px-5 py-2 bg-white/80 dark:bg-[#1C1C1E]/80 border border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-xl text-xs font-medium transition-all shadow-sm"
              >
                Load More ↓
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
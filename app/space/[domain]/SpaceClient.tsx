'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { getSpaceConfig } from '@/config/systemManifest';

// ═══════════════════════════════════════════════════════════════
// 🌐 Mako OS v1.4.0 — Space Client (Frosted Canvas Edition)
// 空间分发核心：业务逻辑不变，视觉统一至浅色毛玻璃
// ═══════════════════════════════════════════════════════════════

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  inserted_at: string;
}

// 空间主题色映射
const ACCENT_MAP: Record<string, {
  text: string;
  textHover: string;
  bg: string;
  iconBg: string;
  iconBorder: string;
  indicator: string;
  btnBg: string;
  cardAccent: string;
}> = {
  learning: {
    text: 'text-blue-600',
    textHover: 'hover:text-blue-700',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-200',
    indicator: 'bg-blue-500',
    btnBg: 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-600',
    cardAccent: 'border-l-blue-500',
  },
  work: {
    text: 'text-violet-600',
    textHover: 'hover:text-violet-700',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-50',
    iconBorder: 'border-violet-200',
    indicator: 'bg-violet-500',
    btnBg: 'bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300 text-violet-600',
    cardAccent: 'border-l-violet-500',
  },
  life: {
    text: 'text-emerald-600',
    textHover: 'hover:text-emerald-700',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-200',
    indicator: 'bg-emerald-500',
    btnBg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-600',
    cardAccent: 'border-l-emerald-500',
  },
  entertainment: {
    text: 'text-amber-600',
    textHover: 'hover:text-amber-700',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-200',
    indicator: 'bg-amber-500',
    btnBg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300 text-amber-600',
    cardAccent: 'border-l-amber-500',
  },
};

export default function SpaceClient({ domain }: { domain: string }) {
  const router = useRouter();
  const config = getSpaceConfig(domain);
  const accent = ACCENT_MAP[domain] || ACCENT_MAP.learning;

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
        .order('inserted_at', { ascending: false });

      if (error) throw error;
      setNotes((data as Note[]) || []);
    } catch (err: any) {
      console.error(err);
      toast.error('数据同步失败，空间流场中断');
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
        onClick: () => {},
      },
    });
  };

  const toggleRevealWord = (id: number) => {
    if (revealedWords.includes(id)) setRevealedWords(revealedWords.filter((item) => item !== id));
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10">

      {/* ═══ 顶部空间标题栏 ═══ */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-black/5">
        <div className="flex items-center space-x-4">
          <div className={`text-4xl p-4 rounded-2xl border ${accent.iconBg} ${accent.iconBorder} shadow-sm`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-xs text-mako-text-muted hover:text-mako-accent transition-colors">Mako OS</Link>
              <span className="text-xs text-mako-text-dim">/</span>
              <span className={`text-xs font-semibold ${accent.text} uppercase tracking-wider`}>{domain}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1 text-mako-text">{config.title}</h1>
            <p className="text-sm text-mako-text-muted italic mt-1">&ldquo;{config.motto}&rdquo;</p>
          </div>
        </div>

        <Link
          href="/galaxy"
          className="mt-4 md:mt-0 mako-btn-ghost inline-flex items-center gap-2"
        >
          <span>🌌</span>
          <span>全域知识星系</span>
        </Link>
      </header>

      {/* ═══ 搜索框 ═══ */}
      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mako-text-muted text-sm">⌕</span>
        <input
          type="text"
          placeholder={`Filter inside ${config.title}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mako-input pl-10"
        />
      </div>

      {/* ═══ 主体两栏布局 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 左栏：Terminal Launchpad */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-semibold text-mako-text-muted uppercase tracking-wider">Terminal Launchpad</h2>
          <div className="p-6 mako-card space-y-4">

            {/* 标准 Block 入口 */}
            <button
              onClick={() => router.push(`/terminal?category=${domain}`)}
              className={`w-full py-4 rounded-xl text-sm font-semibold border transition-all flex flex-col items-center justify-center space-y-1 ${accent.btnBg}`}
            >
              <span className="text-xl">⚡️</span>
              <span>Initialize Standard Block</span>
            </button>

            {/* Learning 专属：词汇模式 */}
            {domain === 'learning' && (
              <button
                onClick={() => router.push('/terminal?category=learning&mode=word')}
                className="w-full py-4 rounded-xl text-sm font-semibold border bg-mako-accent/10 border-mako-accent/20 text-mako-accent hover:bg-mako-accent/20 hover:border-mako-accent/30 transition-all flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">🔤</span>
                <span>Vocabulary Entry Mode</span>
              </button>
            )}

            {/* Learning 专属：命令快查 */}
            {domain === 'learning' && (
              <button
                onClick={() => router.push(`/space/${domain}/commands`)}
                className="w-full py-4 rounded-xl text-sm font-semibold border bg-white/50 border-black/5 text-mako-text-secondary hover:bg-white/70 hover:border-black/10 transition-all flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">💻</span>
                <span>Terminal Cheat Sheet</span>
              </button>
            )}

            {/* Life 专属：全球时钟 */}
            {domain === 'life' && (
              <button
                onClick={() => router.push(`/space/${domain}/timezone`)}
                className="w-full py-4 rounded-xl text-sm font-semibold border bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 transition-all flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">🌍</span>
                <span>Global Time Sync</span>
              </button>
            )}

            <div className="pt-4 border-t border-black/5 text-center">
              <p className="text-[10px] text-mako-text-dim font-mono">
                Data routed to <span className={`font-bold uppercase ${accent.text}`}>{domain}</span> matrix
              </p>
            </div>
          </div>
        </div>

        {/* 右栏：Space Blocks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-mako-text-muted uppercase tracking-wider">
              Space Blocks
            </h2>
            <span className="mako-badge-default">{filteredNotes.length} entries</span>
          </div>

          {loading ? (
            <div className="mako-card p-12 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-mako-text-muted animate-pulse">
                <span className={`w-2 h-2 rounded-full ${accent.indicator} animate-ping`} />
                正在同步空间流场...
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="mako-card p-12 text-center">
              <p className="text-sm text-mako-text-secondary">当前过滤条件下空无一物。</p>
              <p className="text-xs text-mako-text-muted mt-2">Try adjusting your search or create a new block.</p>
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
                    className={`group p-6 mako-card overflow-hidden relative ${isWordCard ? `border-l-4 ${accent.cardAccent}` : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3
                        onClick={() => router.push(`/terminal?id=${note.id}`)}
                        className={`font-bold text-lg text-mako-text ${accent.textHover} transition-colors cursor-pointer tracking-tight`}
                      >
                        {cleanTitle}
                        <span className="text-xs font-normal text-mako-text-dim opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          ✏️ Edit
                        </span>
                      </h3>
                    </div>

                    {isWordCard ? (
                      <div
                        onClick={() => toggleRevealWord(note.id)}
                        className={`cursor-pointer p-4 rounded-xl transition-all border ${
                          isRevealed
                            ? 'bg-white/40 border-black/5'
                            : `${accent.bg} border-black/5`
                        }`}
                      >
                        <div className={`text-sm leading-relaxed prose max-w-none transition-all duration-300 ${
                          isRevealed ? 'blur-0 opacity-100' : 'blur-md opacity-30 select-none'
                        }`}>
                          <ReactMarkdown>{note.content}</ReactMarkdown>
                        </div>
                        {!isRevealed && (
                          <div className={`text-center mt-2 text-xs font-medium ${accent.text}`}>
                            Tap to reveal
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed text-mako-text-secondary prose max-w-none prose-headings:text-mako-text prose-a:text-mako-accent prose-img:rounded-xl">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
                      <span className="text-xs text-mako-text-dim font-mono">
                        {new Date(note.inserted_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-medium text-mako-danger hover:text-red-600 transition-all"
                      >
                        Delete Block
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 加载更多 */}
          {!loading && visibleCount < filteredNotes.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="mako-btn-ghost"
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
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 
import { toast } from 'sonner';

type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';

// 🛸 升级版：终端参数接收器（处理星际穿梭编辑 & 空间专属新建）
function TerminalParamsReceiver({ 
  setTitle, 
  setContent,
  setCategory,
  setEditingId,
  setIsWordMode
}: { 
  setTitle: (t: string) => void; 
  setContent: (c: string) => void; 
  setCategory: (c: AppCategory) => void;
  setEditingId: (id: string) => void;
  setIsWordMode: (mode: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id');
  const spaceCategory = searchParams.get('category');
  const initMode = searchParams.get('mode');

  useEffect(() => {
    if (spaceCategory) setCategory(spaceCategory as AppCategory);
    if (initMode === 'word') setIsWordMode(true);
    if (!noteId) return;

    const loadTargetNote = async () => {
      try {
        const { data, error } = await supabase.from('notes').select('*').eq('id', noteId).single();
        if (error) throw error;
        if (data) {
          setTitle(data.title || '');
          setContent(data.content || '');
          if (data.category) setCategory(data.category as AppCategory);
          setEditingId(noteId);
          toast.success('🛸 目标数据坐标已加载');
        }
      } catch (err) {
        toast.error('穿梭失败，无法读取坐标');
      }
    };
    loadTargetNote();
  }, [noteId, spaceCategory, initMode, setTitle, setContent, setCategory, setEditingId, setIsWordMode]);

  return null;
}

export default function Terminal() {
  const router = useRouter();
  
  // 核心状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AppCategory>('learning');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 单词模式状态
  const [isWordMode, setIsWordMode] = useState(false);
  const [wordData, setWordData] = useState({ word: '', definition: '', example: '' });

  // 提交逻辑
  const handleSubmit = async () => {
    if (!title.trim() && !isWordMode) {
      toast.error('请提供数据块标识 (Title)');
      return;
    }

    const finalTitle = isWordMode ? `[Word] ${wordData.word}` : title;
    const finalContent = isWordMode 
      ? `**Word:** ${wordData.word}\n**Definition:** ${wordData.definition}\n**Example:** ${wordData.example}`
      : content;

    try {
      setIsSubmitting(true);
      const payload = {
        title: finalTitle,
        content: finalContent,
        category: category,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase.from('notes').update(payload).eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('notes').insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingId ? '数据流已更新' : '数据流已注入星海');
      router.push(`/space/${category}`);

    } catch (err: any) {
      toast.error('注入失败', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      
      <Suspense fallback={null}>
        <TerminalParamsReceiver 
          setTitle={setTitle} 
          setContent={setContent} 
          setCategory={setCategory} 
          setEditingId={setEditingId} 
          setIsWordMode={setIsWordMode} 
        />
      </Suspense>

      {/* 头部控制台 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-mako-border pb-4 gap-4">
        <h1 className="text-2xl font-bold tracking-wider text-mako-text flex items-center gap-2">
          <span className={isWordMode ? 'text-mako-accent drop-shadow-[0_0_10px_rgba(224,195,252,0.5)]' : 'text-mako-primary drop-shadow-os-glow'}>
            {editingId ? '🛸' : '>_'}
          </span>
          {editingId ? 'Edit Block' : 'Terminal'}
        </h1>
        
        <div className="flex items-center space-x-3">
          {/* 发光开关按钮 */}
          <button 
            onClick={() => setIsWordMode(!isWordMode)}
            className={`text-xs px-4 py-2 rounded-full transition-all duration-300 font-medium tracking-wide ${
              isWordMode 
                ? 'bg-mako-accent/20 text-mako-accent border border-mako-accent/40 shadow-os-accent-glow' 
                : 'bg-white/5 text-mako-muted border border-white/10 hover:bg-white/10 hover:text-mako-text'
            }`}
          >
            {isWordMode ? '✨ Word Mode: ON' : 'Word Mode: OFF'}
          </button>
          
          {/* 通透下拉菜单 */}
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as AppCategory)}
            className="text-xs bg-white/5 border border-white/10 text-mako-text rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-mako-primary focus:border-mako-primary transition-all cursor-pointer appearance-none"
          >
            <option value="learning" className="bg-[#0B132B]">🧠 Learning</option>
            <option value="work" className="bg-[#0B132B]">💼 Work</option>
            <option value="life" className="bg-[#0B132B]">🌿 Life</option>
            <option value="entertainment" className="bg-[#0B132B]">🎮 Entertainment</option>
          </select>
        </div>
      </div>

      {/* 表单输入区域 (动态全息玻璃面) */}
      <div className={`transition-all duration-500 ${isWordMode ? 'shadow-os-accent-glow' : 'shadow-os-glow'}`}>
        {isWordMode ? (
          // --- 单词模式 UI (晚霞紫光晕) ---
          <div className="mako-glass-card p-6 space-y-4 border-mako-accent/20 bg-mako-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mako-accent/20 rounded-full blur-[80px] pointer-events-none" />
            
            <input 
              type="text" 
              placeholder="Word (e.g. Ubiquitous)" 
              value={wordData.word}
              onChange={(e) => setWordData({...wordData, word: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-mako-accent font-bold text-xl placeholder:text-mako-accent/30 focus:outline-none focus:border-mako-accent/50 focus:bg-white/10 transition-all shadow-inner"
            />
            <input 
              type="text" 
              placeholder="Definition (释义)" 
              value={wordData.definition}
              onChange={(e) => setWordData({...wordData, definition: e.target.value})}
              className="mako-input text-sm"
            />
            <textarea 
              placeholder="Example sentence..." 
              value={wordData.example}
              onChange={(e) => setWordData({...wordData, example: e.target.value})}
              rows={3}
              className="mako-input resize-none text-sm"
            />
          </div>
        ) : (
          // --- 标准模式 UI (晴空蓝光晕) ---
          <div className="mako-glass-card flex flex-col relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-mako-primary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <input 
              type="text" 
              placeholder="Data Block Title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold placeholder:text-mako-muted/50 text-mako-text border-none outline-none px-6 py-5"
            />
            
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-mako-border to-transparent opacity-50" />
            
            <textarea 
              placeholder="Initialize data stream..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent px-6 py-5 outline-none resize-none font-mono text-sm leading-relaxed text-mako-text placeholder:text-mako-muted/30 min-h-[350px] custom-scrollbar"
            />
          </div>
        )}

        {/* 提交按钮 */}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 mt-6 rounded-xl font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 ${
            isWordMode 
              ? 'bg-mako-accent/10 text-mako-accent border border-mako-accent/30 hover:bg-mako-accent/20 hover:shadow-os-accent-glow' 
              : 'mako-btn-primary'
          }`}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Syncing...</span>
          ) : (
            <>
              <span>{editingId ? 'Update Sequence' : 'Commit to OS'}</span>
              <span>{isWordMode ? '✨' : '🚀'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
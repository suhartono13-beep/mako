'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 或者你实际存放 supabase 客户端的绝对路径
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
    // 逻辑 A：如果有 category 参数，说明是从 Space 启动的，锁定分类
    if (spaceCategory) {
      setCategory(spaceCategory as AppCategory);
    }
    // 逻辑 B：如果指定了 word 模式，自动开启单词模式
    if (initMode === 'word') {
      setIsWordMode(true);
    }

    // 逻辑 C：如果有 id，说明是穿梭过来修改旧笔记的
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
      toast.error('Title is required in standard mode');
      return;
    }

    // 如果是单词模式，自动合成标题和内容
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
        // 更新逻辑
        const { error: updateError } = await supabase.from('notes').update(payload).eq('id', editingId);
        error = updateError;
      } else {
        // 新增逻辑
        const { error: insertError } = await supabase.from('notes').insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingId ? 'Block Updated' : 'Block Committed');
      
      // ✨ 提交成功后，智能返回对应的空间页面！
      router.push(`/space/${category}`);

    } catch (err: any) {
      toast.error('Failed to commit', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* 隐式参数接收器 */}
      <Suspense fallback={null}>
        <TerminalParamsReceiver 
          setTitle={setTitle} 
          setContent={setContent} 
          setCategory={setCategory} 
          setEditingId={setEditingId} 
          setIsWordMode={setIsWordMode} 
        />
      </Suspense>

      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {editingId ? 'Edit Block 🛸' : 'Terminal >_'}
        </h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsWordMode(!isWordMode)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              isWordMode 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black' 
                : 'bg-transparent border-gray-300 text-gray-500 hover:border-gray-500'
            }`}
          >
            {isWordMode ? 'Word Mode: ON' : 'Word Mode: OFF'}
          </button>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as AppCategory)}
            className="text-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="learning">🧠 Learning</option>
            <option value="work">💼 Work</option>
            <option value="life">🌿 Life</option>
            <option value="entertainment">🎮 Entertainment</option>
          </select>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="space-y-4">
        {isWordMode ? (
          // 单词模式 UI
          <div className="space-y-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <input 
              type="text" 
              placeholder="Word (e.g. Ubiquitous)" 
              value={wordData.word}
              onChange={(e) => setWordData({...wordData, word: e.target.value})}
              className="w-full bg-white dark:bg-[#1C1C1E] px-4 py-3 rounded-xl border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-lg"
            />
            <input 
              type="text" 
              placeholder="Definition (无处不在的)" 
              value={wordData.definition}
              onChange={(e) => setWordData({...wordData, definition: e.target.value})}
              className="w-full bg-white dark:bg-[#1C1C1E] px-4 py-3 rounded-xl border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
            <textarea 
              placeholder="Example sentence..." 
              value={wordData.example}
              onChange={(e) => setWordData({...wordData, example: e.target.value})}
              rows={3}
              className="w-full bg-white dark:bg-[#1C1C1E] px-4 py-3 rounded-xl border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-sm"
            />
          </div>
        ) : (
          // 标准模式 UI
          <>
            <input 
              type="text" 
              placeholder="Block Title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold placeholder:text-gray-400 border-none outline-none px-2 py-2"
            />
            <textarea 
              placeholder="Start typing your data..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-2xl border border-black/5 dark:border-white/5 outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-1 focus:ring-gray-400 transition-all resize-none font-mono text-sm leading-relaxed"
            />
          </>
        )}

        {/* 提交按钮 */}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting ? 'Commiting...' : (editingId ? 'Update Block' : 'Commit to OS')}
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/layout';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';

export default function Terminal() {
  const router = useRouter();
  const [category, setCategory] = useState<AppCategory>('learning');
  const [isWordMode, setIsWordMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false); // ✨ 新增：AI 润色状态

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordName, setWordName] = useState('');
  const [wordMeaning, setWordMeaning] = useState('');
  const [wordExample, setWordExample] = useState('');

  // 处理图片上传压缩
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const toastId = toast.loading('Compressing image...');
      
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 };
      const compressedFile = await imageCompression(file, options);
      
      toast.loading('Uploading to database...', { id: toastId });

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('note-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(fileName);

      if (isWordMode) setWordExample((prev) => prev + `\n![Image](${publicUrl})\n`);
      else setContent((prev) => prev + `\n![Image](${publicUrl})\n`);
      
      toast.success('Image Ready', { id: toastId });
    } catch (error: any) {
      toast.error('Process Failed', { description: error.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  // ✨ 新增：处理 AI 润色逻辑
  async function handleAIPolish() {
    if (!content.trim()) {
      toast.warning('No Content', { description: '请先输入一些内容再进行润色。' });
      return;
    }

    try {
      setIsPolishing(true);
      const toastId = toast.loading('AI is polishing your note...');

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to polish text');

      setContent(data.result);
      toast.success('Magic Applied ✨', { id: toastId });
    } catch (error: any) {
      toast.error('AI Polish Failed', { description: error.message });
    } finally {
      setIsPolishing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let finalTitle = title;
    let finalContent = content;

    if (isWordMode && category === 'learning') {
      if (!wordName.trim() || !wordMeaning.trim()) {
        toast.warning('Missing Fields', { description: '请填写单词和释义。' });
        return;
      }
      finalTitle = `🔤 ${wordName.trim()}`;
      finalContent = `### 📖 释义与音标\n${wordMeaning.trim()}\n\n### 💡 上下文例句\n${wordExample.trim() || '暂无例句'}`;
    } else {
      if (!finalTitle.trim() || !finalContent.trim()) {
        toast.warning('Missing Fields', { description: '请填写标题与内容。' });
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('notes').insert([{ title: finalTitle, content: finalContent, category }]);
    setIsSubmitting(false);

    if (error) {
      toast.error('Sync Failed', { description: error.message });
    } else {
      toast.success('Block Committed');
      router.push('/matrix');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative z-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Terminal</h2>
          <p className="text-sm text-gray-500 mt-1">Initialize a new data block.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/40 dark:border-white/[0.05] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        
        <div className="flex justify-between items-center pb-4 border-b border-black/[0.05] dark:border-white/[0.05]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isWordMode && category === 'learning' ? 'Vocabulary Entry' : 'Standard Block'}
          </h3>
          
          <div className="flex items-center space-x-3">
            {category === 'learning' && (
              <button type="button" onClick={() => setIsWordMode(!isWordMode)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${isWordMode ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/20'}`}>
                {isWordMode ? 'Word Mode' : 'Toggle Word'}
              </button>
            )}
            <label className={`text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-full cursor-pointer font-medium transition-all ${uploading ? 'bg-black/5 text-gray-400 cursor-not-allowed' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'}`}>
              <span>{uploading ? 'Processing...' : 'Attach Image'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        </div>
        
        {isWordMode && category === 'learning' ? (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <input type="text" placeholder="Word" value={wordName} onChange={(e) => setWordName(e.target.value)} className="flex-1 px-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-base font-medium focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
              <select value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} className="w-1/3 px-3 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all outline-none">
                <option value="learning">Knowledge</option>
                <option value="work">Operations</option>
                <option value="life">Biometrics</option>
                <option value="entertainment">Simulations</option>
              </select>
            </div>
            <input type="text" placeholder="Phonetic & Meaning" value={wordMeaning} onChange={(e) => setWordMeaning(e.target.value)} className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-sm focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
            <textarea placeholder="Example sentence..." value={wordExample} onChange={(e) => setWordExample(e.target.value)} rows={4} className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-sm focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 transition-all resize-none outline-none" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-base font-semibold focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
              <select value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} className="w-1/3 px-3 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all outline-none">
                <option value="learning">Knowledge</option>
                <option value="work">Operations</option>
                <option value="life">Biometrics</option>
                <option value="entertainment">Simulations</option>
              </select>
            </div>
            
            <div className="relative">
              <textarea placeholder="Write something messy... let AI format it for you." value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-xl text-sm focus:bg-white/80 dark:focus:bg-[#1C1C1E]/80 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 transition-all resize-none outline-none pb-12" />
              
              {/* ✨ AI 润色魔法按钮 */}
              <button 
                type="button" 
                onClick={handleAIPolish} 
                disabled={isPolishing || !content.trim()} 
                className="absolute bottom-3 right-3 text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/10"
              >
                <span>{isPolishing ? '✨ Polishing...' : '✨ AI Polish'}</span>
              </button>
            </div>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-blue-600/90 hover:bg-blue-600 backdrop-blur-md text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50">
          {isSubmitting ? 'Syncing...' : 'Commit Block'}
        </button>
      </form>
    </div>
  );
}
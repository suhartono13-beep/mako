'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/layout';

type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';

export default function Terminal() {
  const router = useRouter();
  const [category, setCategory] = useState<AppCategory>('learning');
  const [isWordMode, setIsWordMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordName, setWordName] = useState('');
  const [wordMeaning, setWordMeaning] = useState('');
  const [wordExample, setWordExample] = useState('');

  // 图像上传
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('图片限制 5MB 以内。');

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('note-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(fileName);

      if (isWordMode) {
        setWordExample((prev) => prev + `\n![Image](${publicUrl})\n`);
      } else {
        setContent((prev) => prev + `\n![Image](${publicUrl})\n`);
      }
    } catch (error: any) {
      alert('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // 提交
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let finalTitle = title;
    let finalContent = content;

    if (isWordMode && category === 'learning') {
      if (!wordName.trim() || !wordMeaning.trim()) return alert('请填写单词和释义。');
      finalTitle = `🔤 ${wordName.trim()}`;
      finalContent = `### 📖 释义与音标\n${wordMeaning.trim()}\n\n### 💡 上下文例句\n${wordExample.trim() || '暂无例句'}`;
    } else {
      if (!finalTitle.trim() || !finalContent.trim()) return alert('请填写标题与内容。');
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('notes').insert([{ title: finalTitle, content: finalContent, category }]);
    setIsSubmitting(false);

    if (error) {
      alert('同步失败: ' + error.message);
    } else {
      // 成功后自动跳转到数据流页面查看
      router.push('/matrix');
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Input Terminal</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">STREAM_INJECT_PROTOCOL</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[2rem] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-cyan-400 transition-colors"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <span className="mr-2 text-indigo-500">◆</span> {isWordMode && category === 'learning' ? 'Vocab Matrix' : 'New Block'}
          </h3>
          
          <div className="flex items-center space-x-3">
            {category === 'learning' && (
              <button type="button" onClick={() => setIsWordMode(!isWordMode)} className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${isWordMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                {isWordMode ? '✓ Word Mode' : '+ Word Tool'}
              </button>
            )}
            <label className={`text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all ${uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'}`}>
              <span>{uploading ? 'Processing...' : 'Attach Image'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        </div>
        
        {isWordMode && category === 'learning' ? (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="New Word..." value={wordName} onChange={(e) => setWordName(e.target.value)} className="col-span-2 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-800 dark:text-slate-100 transition-all" />
              <select value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} className="px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="learning">🧠 Knowledge</option>
                <option value="work">⚡ Operations</option>
                <option value="life">🧬 Biometrics</option>
                <option value="entertainment">🎮 Simulations</option>
              </select>
            </div>
            <input type="text" placeholder="Phonetic & Meaning..." value={wordMeaning} onChange={(e) => setWordMeaning(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-800 dark:text-slate-100" />
            <textarea placeholder="Context Example Sentence..." value={wordExample} onChange={(e) => setWordExample(e.target.value)} rows={4} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-800 dark:text-slate-100 font-mono resize-none" />
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold tracking-wide shadow-md">
              {isSubmitting ? 'Injecting...' : 'INJECT INTO VOCAB MATRIX'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex space-x-4">
              <input type="text" placeholder="Block Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-4 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 text-lg font-bold focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 text-slate-800 dark:text-slate-100 placeholder-slate-300" />
              <select value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} className="w-1/3 px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="learning">🧠 Knowledge</option>
                <option value="work">⚡ Operations</option>
                <option value="life">🧬 Biometrics</option>
                <option value="entertainment">🎮 Simulations</option>
              </select>
            </div>
            <textarea placeholder="Initialize data stream... (Markdown supported)" value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100 font-mono resize-none" />
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold tracking-wide hover:scale-[1.01] transition-all disabled:opacity-50">
              {isSubmitting ? 'Syncing...' : 'COMMIT BLOCK'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
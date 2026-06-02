'use client'; // 声明这是一个客户端组件，方便在 Cloudflare 完美运行并动态加载数据

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// 1. 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 定义数据类型
interface Note {
  id: number;
  title: string;
  content: string;
  inserted_at: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. 页面加载时自动去 Supabase 数据库拉取数据
  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('inserted_at', { ascending: false }); // 按时间倒序排列

      if (!error && data) {
        setNotes(data);
      }
      setLoading(false);
    }
    fetchNotes();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">正在同步学习笔记...</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 border-b pb-4">
        📚 Mako 的个人学习与生活看板
      </h1>
      
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-slate-400 text-center">暂无笔记，去 Supabase 数据库加一条吧！</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-5 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <h2 className="text-xl font-semibold text-blue-600 mb-2">{note.title}</h2>
              <p className="text-slate-600 whitespace-pre-wrap">{note.content}</p>
              <span className="text-xs text-slate-400 block mt-3">
                ⏰ 发布时间: {new Date(note.inserted_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
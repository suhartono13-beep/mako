import { createClient } from '@supabase/supabase-js';

// 1. 初始化并导出全局唯一的 Supabase 实例
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
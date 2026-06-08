import React from 'react';
import CommandCheatSheetPage from '@/app/components/CommandCheatSheetPage';

// 1. 在服务端生成静态 HTML 路径清单
export async function generateStaticParams() {
  return [
    { domain: 'learning' },
    { domain: 'work' },
    { domain: 'life' },
    { domain: 'entertainment' },
  ];
}

// 2. 服务端页面外壳，直接渲染我们的客户端逻辑组件
export default function Page() {
  return <CommandCheatSheetPage />;
}
import React from 'react';
import TimezoneConverterPage from '@/app/components/TimezoneConverterPage';

// 服务端生成静态 HTML 路径清单
export async function generateStaticParams() {
  return [
    { domain: 'learning' },
    { domain: 'work' },
    { domain: 'life' },
    { domain: 'entertainment' },
  ];
}

export default function Page() {
  return <TimezoneConverterPage />;
}
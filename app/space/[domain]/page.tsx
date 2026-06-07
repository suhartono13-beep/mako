import SpaceClient from './SpaceClient';

// 🚀 静态路由配置不变
export function generateStaticParams() {
  return [
    { domain: 'learning' },
    { domain: 'work' },
    { domain: 'life' },
    { domain: 'entertainment' },
  ];
}

// ✨ 修复关键点：在 Next.js 15+ 中，params 是一个 Promise，必须用 async/await 解包
export default async function SpacePage({ params }: { params: Promise<{ domain: string }> }) {
  // 等待参数解析完毕
  const resolvedParams = await params;
  
  return <SpaceClient domain={resolvedParams.domain} />;
}
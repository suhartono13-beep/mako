const CACHE_NAME = 'mako-os-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  // 如果你加入了 icon-192.png 等静态图标，也可以写在这里
];

// 1. 安装时缓存核心资产
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. 激活时清理旧缓存（你的这段逻辑非常完美，保留）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. 拦截请求（满足 PWA 必要条件，并排除干扰项）
self.addEventListener('fetch', (event) => {
  // 只处理常规的 GET 请求
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 🚨 【核心优化】以下情况直接放行（走网络），Service Worker 绝不拦截：
  if (
    url.pathname.startsWith('/_next/') ||      // Next.js 内部打包打包文件、HMR 热更新
    url.pathname.startsWith('/api/') ||        // 我们的 AI 润色等后端 API
    url.hostname.includes('supabase.co') ||    // Supabase 数据库和存储请求
    url.protocol === 'chrome-extension:'       // 浏览器插件请求（比如前面整出 Hydration 报错的翻译插件）
  ) {
    return;
  }

  // 4. 网络优先策略（Network-First）：有网时看最新数据，断网时拿缓存垫底
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
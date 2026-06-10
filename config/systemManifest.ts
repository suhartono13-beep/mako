// ═══════════════════════════════════════════════════════════════
// 🧬 Mako OS v1.4.0 — System Manifest
// 核心系统配置、空间主题定义、版本日志
// ═══════════════════════════════════════════════════════════════

export interface LogEntry {
  version: string;
  date: string;
  title: string;
  type: 'feat' | 'fix' | 'refactor' | 'docs';
  changes: string[];
}

export interface SpaceConfig {
  id: string;
  title: string;
  subtitle: string;
  motto: string;
  icon: string;
  accentColor: string;
  modules: string[];
}

// ─── 四大空间主题配置 ───
export const SPACE_CONFIGS: SpaceConfig[] = [
  {
    id: 'learning',
    title: 'Learning',
    subtitle: 'Knowledge & Vocabulary',
    motto: 'Knowledge is not stored. It is awakened.',
    icon: '🧠',
    accentColor: 'learning',
    modules: ['commands', 'notes', 'vocabulary'],
  },
  {
    id: 'work',
    title: 'Work',
    subtitle: 'Operations & Projects',
    motto: 'Build in silence. Ship with precision.',
    icon: '💼',
    accentColor: 'work',
    modules: ['notes', 'blocks'],
  },
  {
    id: 'life',
    title: 'Life',
    subtitle: 'Biometrics & Daily',
    motto: 'Protect your rhythm. Protect your world.',
    icon: '🌿',
    accentColor: 'life',
    modules: ['timezone', 'notes'],
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    subtitle: 'Simulations & Games',
    motto: 'Even systems need to dream.',
    icon: '🎮',
    accentColor: 'entertainment',
    modules: ['notes'],
  },
];

// 快速查找 helper
export function getSpaceConfig(domain: string): SpaceConfig {
  return SPACE_CONFIGS.find((s) => s.id === domain) || SPACE_CONFIGS[0];
}

// ─── 系统核心声明 ───
export const SYSTEM_MANIFEST = {
  core: {
    os: "Mako OS v1.4.0",
    codename: "Frosted Canvas",
    framework: "Next.js 16 (App Router)",
    styling: "Tailwind CSS v4 + Frosted Glass Theme (Fixed Light-Glass)",
    database: "Supabase (Auth & PostgreSQL)",
    constraints: [
      "Strict Static Export (output: 'export')",
      "No dynamic SSR / No middleware.ts redirection",
      "Client-side Auth Guard via RootLayout & useAuth hook",
      "Dynamic routes [domain] MUST use generateStaticParams",
      "Visual FX controlled by Performance Mode (LocalStorage)"
    ],
    fileTree: `
.
├── app/
│   ├── globals.css          # Frosted Glass 设计变量与全局样式
│   ├── layout.tsx           # 全局 Layout (Auth Guard + Navbar + AmbientBackground)
│   ├── page.tsx             # 根路由 (Mako OS 控制台首页)
│   ├── system/              # 🤖 系统内核日志模块
│   └── space/[domain]/      # 四大维度空间 (需静态导出)
│       ├── commands/        # Terminal 快查模块
│       └── timezone/        # 时差换算模块
├── components/
│   ├── ui/
│   │   └── AmbientBackground.tsx  # 全屏插画背景 + 遮罩
│   ├── SpaceClient.tsx      # 空间主页面的客户端路由与卡片分发
│   ├── CommandCheatSheet.tsx# 命令快查组件 (LocalStorage 持久化)
│   └── TimezoneConverter.tsx# 时区组件 (LocalStorage 持久化)
├── config/
│   └── systemManifest.ts    # 核心系统配置文件 (当前文件)
├── public/
│   └── image/
│       └── image.gif        # 全屏动漫插画背景
└── hooks/
    ├── useAuth.ts           # 核心鉴权逻辑 (Supabase session 监听)
    └── usePerformanceMode.ts# FX 性能模式 (LocalStorage 持久化)
    `,
    dataFlow: [
      "用户状态 (Auth): Supabase Session 托管，客户端通过 onAuthStateChange 监听拦截。",
      "基础业务数据: Supabase PostgreSQL 提供增删改查 (Notes, Blocks)。",
      "轻量级用户配置 (命令快查、时区订阅、FX模式): 浏览器 LocalStorage 无感持久化。"
    ]
  },
  history: [
    {
  version: "v1.4.1",
  date: "2026-06-11",
  title: "Mako-Chan 看板娘情感模块上线",
  type: "feat",
  changes: [
        "新增系统看板娘 Mako-Chan 组件，固定右下角常驻。",
        "时间感知台词系统：根据早/午/晚/深夜自动切换对话内容。",
        "打字机气泡效果：逐字输出 + 光标闪烁，增强拟人感。",
        "角色特效：外圈渐变旋转光环 + 呼吸脉冲边框 + hover 柔光。",
        "交互系统：点击角色切换随机台词，支持收起/召唤。",
        "全局情感层：从工具型系统向伙伴型系统迈出第一步。"
      ]
    },
    {
      version: "v1.4.0",
      date: "2026-06-10",
      title: "Frosted Canvas Interface Upgrade",
      type: "refactor",
      changes: [
        "全站视觉重构：动漫插画全屏背景 + 浅色毛玻璃卡片。",
        "建立 Frosted Glass CSS 设计变量系统。",
        "AmbientBackground 组件：全屏 GIF 背景 + 多层遮罩。",
        "引入 Performance Mode (Full / Balanced / Lite) 视觉降级机制。",
        "Dashboard 控制台化：Hero 区 + 系统状态条 + 空间入口卡片。",
        "Navbar 升级为毛玻璃控制条，加入 FX 模式入口。",
        "SpaceClient 视觉统一至 Frosted Glass 风格。",
        "移除日夜模式切换，固定浅色毛玻璃主题。"
      ]
    },
    {
      version: "v1.3.0",
      date: "2026-06-08",
      title: "全局内核监控与 Layout 架构重构",
      type: "refactor",
      changes: [
        "重构 RootLayout，引入全局极简 Navbar 与 ThemeProvider 环境光背景。",
        "将 Auth Guard 登录墙无缝集成至全局 Layout，实现统一拦截。",
        "在全局右上角剥离出独立的 SYSTEM_KERNEL 入口，作为系统底层日志面板。"
      ]
    },
    {
      version: "v1.2.0",
      date: "2026-06-08",
      title: "全球时差矩阵与动态编辑落地",
      type: "feat",
      changes: [
        "在 Life 空间新增全球时差换算矩阵，支持 8 个核心城市实时同步。",
        "重构 Learning 空间的 Terminal Cheat Sheet，引入 localStorage 纯前端增删改。",
        "修复静态导出模式下动态路由 [domain] 触发的 404 与 use client 冲突 Bug。"
      ]
    },
    {
      version: "v1.1.0",
      date: "2026-06-05",
      title: "四维空间矩阵与词汇模式",
      type: "feat",
      changes: [
        "确立 Learning, Work, Life, Entertainment 四大核心分流空间。",
        "在知识空间上线词汇探索模式，支持全屏遮罩与 Tap-to-reveal 记忆卡片功能。"
      ]
    },
    {
      version: "v1.0.0",
      date: "2026-06-01",
      title: "系统内核初始化",
      type: "feat",
      changes: [
        "Mako OS 项目立项，搭建 Next.js 基础骨架。",
        "打通 Supabase 数据库通信，实现标准数据块路由分发。"
      ]
    }
  ] as LogEntry[]
};
export interface LogEntry {
  version: string;
  date: string;
  title: string;
  type: 'feat' | 'fix' | 'refactor' | 'docs';
  changes: string[];
}

export const SYSTEM_MANIFEST = {
  core: {
    os: "Mako OS v1.3.0",
    codename: "Emerald Launchpad",
    framework: "Next.js 16 (App Router)",
    styling: "Tailwind CSS + next-themes (Dark/Light)",
    database: "Supabase (Auth & PostgreSQL)",
    constraints: [
      "Strict Static Export (output: 'export')",
      "No dynamic SSR / No middleware.ts redirection",
      "Client-side Auth Guard via RootLayout & useAuth hook",
      "Dynamic routes [domain] MUST use generateStaticParams"
    ],
    // 🚀 新增：核心文件架构图，喂给 AI 最有效
    fileTree: `
.
├── app/
│   ├── globals.css          # 全局样式与 Tailwind 注入
│   ├── layout.tsx           # 全局 Layout (带 Auth 拦截、全局 Navbar、系统 Kernel 入口)
│   ├── page.tsx             # 根路由 (Mako OS 控制台首页)
│   ├── system/              # 🤖 系统内核日志模块
│   └── space/[domain]/      # 四大维度空间 (需静态导出)
│       ├── commands/        # Terminal 快查模块
│       └── timezone/        # 时差换算模块
├── components/
│   ├── SpaceClient.tsx      # 空间主页面的客户端路由与卡片分发
│   ├── CommandCheatSheet.tsx# 命令快查组件 (LocalStorage 持久化)
│   └── TimezoneConverter.tsx# 时区组件 (LocalStorage 持久化)
├── config/
│   └── systemManifest.ts    # 核心系统配置文件 (当前文件)
└── hooks/
    └── useAuth.ts           # 核心鉴权逻辑 (Supabase session 监听)
    `,
    // 🚀 新增：数据存储策略说明
    dataFlow: [
      "用户状态 (Auth): Supabase Session 托管，客户端通过 onAuthStateChange 监听拦截。",
      "基础业务数据: Supabase PostgreSQL 提供增删改查 (Notes, Blocks)。",
      "轻量级用户配置 (如：命令快查面板编辑、时区城市订阅): 强依赖浏览器 LocalStorage 进行无感持久化。"
    ]
  },
  history: [
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
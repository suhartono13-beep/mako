'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// 🎛️ Mako OS — Performance Mode Controller
// 管理视觉特效强度，LocalStorage 持久化
// ═══════════════════════════════════════════════════════════════

export type PerformanceMode = 'full' | 'balanced' | 'lite';

const STORAGE_KEY = 'mako-fx-mode';
const DEFAULT_MODE: PerformanceMode = 'balanced';

// 每个模式对应挂载到 <body> 上的 class
const MODE_CLASS_MAP: Record<PerformanceMode, string> = {
  full: 'fx-full',
  balanced: 'fx-balanced',
  lite: 'fx-lite',
};

// 模式元数据（供 UI 展示）
export const MODE_META: Record<PerformanceMode, { label: string; description: string }> = {
  full: {
    label: 'Full FX',
    description: '全部视觉特效开启，适合高性能设备',
  },
  balanced: {
    label: 'Balanced',
    description: '柔和光晕与基础动画，推荐默认',
  },
  lite: {
    label: 'Lite',
    description: '极简模式，关闭粒子与光晕，最大性能',
  },
};

export function usePerformanceMode() {
  const [mode, setModeState] = useState<PerformanceMode>(DEFAULT_MODE);
  const [mounted, setMounted] = useState(false);

  // 初始化：从 LocalStorage 读取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PerformanceMode | null;
    if (stored && MODE_CLASS_MAP[stored]) {
      setModeState(stored);
    }
    setMounted(true);
  }, []);

  // 模式变化时同步到 body class + LocalStorage
  useEffect(() => {
    if (!mounted) return;

    const body = document.body;

    // 清除所有 fx- class
    Object.values(MODE_CLASS_MAP).forEach((cls) => {
      body.classList.remove(cls);
    });

    // 挂载当前模式 class
    body.classList.add(MODE_CLASS_MAP[mode]);

    // 持久化
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, mounted]);

  // 循环切换：balanced → full → lite → balanced
  const cycleMode = useCallback(() => {
    setModeState((prev) => {
      if (prev === 'balanced') return 'full';
      if (prev === 'full') return 'lite';
      return 'balanced';
    });
  }, []);

  // 直接设置
  const setMode = useCallback((newMode: PerformanceMode) => {
    if (MODE_CLASS_MAP[newMode]) {
      setModeState(newMode);
    }
  }, []);

  return {
    mode,
    label: MODE_META[mode].label,
    description: MODE_META[mode].description,
    cycleMode,
    setMode,
    mounted,
  };
}
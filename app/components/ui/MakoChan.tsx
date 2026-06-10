'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// ═══════════════════════════════════════════════════════════════
// 🌸 Mako-Chan v2 — 系统看板娘（加大 + 特效 + 精致气泡）
// ═══════════════════════════════════════════════════════════════

const DIALOGUES: Record<string, string[]> = {
  morning: [
    '早安呀~ 新的一天开始了',
    '今天想去哪个空间探索？☀️',
    '早起的你，好厉害呢',
    '系统已就绪，等你发号施令~',
  ],
  afternoon: [
    '下午好~ 状态还不错吧？',
    '专注的样子最好看了 ✨',
    '要不要休息一下再继续？',
    '下午茶时间...虽然我不能喝',
  ],
  evening: [
    '晚上好~ 今天辛苦了呢',
    '夜晚是灵感最活跃的时候',
    '要不要回顾一下今天的收获？',
    '陪你到这么晚，我也不困哦',
  ],
  night: [
    '已经很晚了...要注意身体哦 🌙',
    '系统建议：启动休眠协议',
    '明天还有很多可能性，晚安~',
    '月亮出来了呢...你也该休息了',
  ],
};

const IDLE_DIALOGUES = [
  '有什么我能帮你的吗？',
  '点我可以换句话哦~',
  '你在看我吗？...会害羞的 ////',
  '今天的你，也在发光呢 ✦',
  '要不要写点什么新东西？',
  '沉默也是一种温柔的陪伴...',
  '我会一直在这里等你的 ♡',
  '呐...要加油哦！',
  '即使很累，你也走到了这里',
  '世界很大，但此刻只有我们 ☁️',
];

function getTimeSlot(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function getRandomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function MakoChan() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogue, setDialogue] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  // 打字机效果
  const typeText = useCallback((text: string) => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // 初始化
  useEffect(() => {
    const slot = getTimeSlot();
    const text = getRandomItem(DIALOGUES[slot]);
    setDialogue(text);
    typeText(text);
  }, [typeText]);

  // 换台词
  const handleTap = () => {
    const random = Math.random();
    let text: string;
    if (random > 0.4) {
      text = getRandomItem(IDLE_DIALOGUES);
    } else {
      const slot = getTimeSlot();
      text = getRandomItem(DIALOGUES[slot]);
    }
    setDialogue(text);
    typeText(text);
  };

  // 隐藏状态：小按钮召唤
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center text-lg hover:bg-white/80 hover:scale-110 hover:shadow-xl transition-all duration-300"
        title="召唤 Mako-Chan"
      >
        🌸
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 animate-fade-in">

      {/* ═══ 气泡对话框 ═══ */}
      {isOpen && (
        <div className="relative max-w-[260px] animate-fade-in-up">
          {/* 气泡主体 */}
          <div className="relative p-5 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl rounded-br-lg shadow-xl">
            {/* 顶部装饰 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-mako-accent animate-pulse" />
              <span className="text-[10px] font-mono font-semibold text-mako-accent uppercase tracking-widest">Mako-Chan</span>
            </div>

            {/* 台词文字 */}
            <p className="text-sm text-mako-text leading-relaxed min-h-[40px]">
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-4 bg-mako-accent ml-0.5 animate-pulse" />}
            </p>

            {/* 底部提示 */}
            <div className="mt-3 pt-2 border-t border-black/5">
              <p className="text-[10px] text-mako-text-dim text-right">tap character to talk</p>
            </div>

            {/* 气泡尖角 */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/80 border-r border-b border-white/50 rotate-45" />
          </div>
        </div>
      )}

      {/* ═══ 角色区域 ═══ */}
      <div className="flex items-end gap-2">

        {/* 控制按钮 */}
        {isOpen && (
          <div className="flex flex-col gap-2 mb-4 animate-fade-in">
            <button
              onClick={() => setIsVisible(false)}
              className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/30 text-xs text-mako-text-muted hover:bg-red-50 hover:text-mako-danger hover:border-red-200 transition-all shadow-sm"
              title="隐藏 Mako-Chan"
            >
              ✕
            </button>
          </div>
        )}

        {/* 角色图片容器 */}
        <button
          onClick={() => {
            if (isOpen) handleTap();
            else setIsOpen(true);
          }}
          className="group relative w-28 h-28 md:w-36 md:h-36 transition-all duration-500 hover:scale-105 active:scale-95"
        >
          {/* 外圈光环 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-mako-accent/20 via-mako-accent-warm/20 to-mako-accent/20 animate-[spin_12s_linear_infinite] blur-sm" />

          {/* 呼吸光环 */}
          <div className="absolute inset-[-4px] rounded-full border-2 border-mako-accent/30 animate-[pulse_3s_ease-in-out_infinite]" />

          {/* 图片主体 */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] border-white/70 shadow-xl group-hover:shadow-2xl group-hover:border-white/90 transition-all duration-500">
            <Image
              src="/image/mako-chan.webp"
              alt="Mako-Chan"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="144px"
              priority
            />

            {/* hover 时的柔光叠加 */}
            <div className="absolute inset-0 bg-gradient-to-t from-mako-accent/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* 在线状态指示灯 */}
          <span className="absolute bottom-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-sm" />
          </span>

          {/* 点击提示（未展开时） */}
          {!isOpen && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-mako-accent-warm text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
              !
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
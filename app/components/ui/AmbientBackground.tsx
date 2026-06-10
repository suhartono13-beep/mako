'use client';

// ═══════════════════════════════════════════════════════════════
// 🖼️ Mako OS v1.4.0 — Ambient Background
// 全屏动漫插画 + 半透明遮罩
// 受 Performance Mode 控制（fx-lite 时关闭动画）
// ═══════════════════════════════════════════════════════════════

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-10]">

      {/* Layer 1: 全屏插画背景 */}
      <div
        className="mako-bg-image absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url(/image/image.gif)',
        }}
      />

      {/* Layer 2: 可读性遮罩（柔和压暗，让浅色卡片可读） */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Layer 3: 顶部渐变（Navbar 区域增强可读性） */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/30 to-transparent" />

      {/* Layer 4: 底部渐变收束 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent" />
    </div>
  );
}
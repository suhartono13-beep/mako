'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

type AppCategory = 'learning' | 'work' | 'life' | 'entertainment';
type LinkType = 'normal' | 'derive' | 'support' | 'conflict';

interface Note {
  id: number;
  title: string;
  content: string;
  category: AppCategory;
  inserted_at: string;
}

interface SemanticLink {
  targetId: number;
  type: LinkType;
}

interface PlanetNode {
  note: Note;
  cleanTitle: string;
  links: SemanticLink[];
  linkedByNodeIds: number[];
  currentAlpha: number;       
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  glowColor: string;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  pulse: number;
  pulseSpeed: number;
}

export default function InteractiveGalaxy() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<PlanetNode[]>([]);
  
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingCameraRef = useRef(false);
  const draggedNodeRef = useRef<PlanetNode | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastCameraRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000, hoveredNode: null as PlanetNode | null });
  const hasMovedRef = useRef(false);
  
  const selectedNodeIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNote ? selectedNote.id : null;
  }, [selectedNote]);

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('inserted_at', { ascending: false });
      
      if (!error && data) {
        setNotes(data as Note[]);
        initGalaxyNodes(data as Note[]);
      }
      setLoading(false);
    }
    fetchNotes();
  }, []);

  const initGalaxyNodes = (rawNotes: Note[]) => {
    const baseWidth = window.innerWidth;
    const baseHeight = window.innerHeight;

    const centers: Record<AppCategory, { x: number; y: number; color: string; glow: string }> = {
      learning: { x: baseWidth * 0.2, y: baseHeight * 0.3, color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
      work: { x: baseWidth * 0.8, y: baseHeight * 0.3, color: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
      life: { x: baseWidth * 0.3, y: baseHeight * 0.8, color: '#14B8A6', glow: 'rgba(20, 184, 166, 0.4)' },
      entertainment: { x: baseWidth * 0.7, y: baseHeight * 0.8, color: '#F97316', glow: 'rgba(249, 115, 22, 0.4)' },
    };

    const nodes: PlanetNode[] = rawNotes.map((note, index) => {
      const center = centers[note.category] || { x: baseWidth / 2, y: baseHeight / 2, color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' };
      const orbitRadius = 60 + (index % 8) * 40 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      const cleanTitle = note.title.replace('🔤 ', '').replace('[Word] ', '').trim();

      return {
        note,
        cleanTitle,
        links: [],
        linkedByNodeIds: [],
        currentAlpha: 1.0, 
        x: center.x + Math.cos(angle) * orbitRadius,
        y: center.y + Math.sin(angle) * orbitRadius,
        targetX: center.x,
        targetY: center.y,
        radius: 6, 
        color: center.color,
        glowColor: center.glow,
        angle,
        orbitRadius,
        orbitSpeed: 0.001 + (Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1),
        pulse: Math.random(),
        pulseSpeed: 0.01 + Math.random() * 0.02
      };
    });

    // 🚀 智能语义网络嗅探 (NLP-like Markdown Scanner)
    nodes.forEach(node => {
      nodes.forEach(targetNode => {
        if (node.note.id === targetNode.note.id || targetNode.cleanTitle.length <= 1) return;

        const content = node.note.content;
        const titleEscaped = targetNode.cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 构建复杂的上下文语义嗅探正则
        const deriveRegex = new RegExp(`(->|递进|衍生|演化)\\s*.*?${titleEscaped}`, 'i');
        const supportRegex = new RegExp(`(\\+|支持|证实|协同)\\s*.*?${titleEscaped}`, 'i');
        const conflictRegex = new RegExp(`(-|冲突|反对|反思)\\s*.*?${titleEscaped}`, 'i');

        if (content.includes(targetNode.cleanTitle)) {
          let type: LinkType = 'normal';
          
          if (conflictRegex.test(content)) type = 'conflict';
          else if (supportRegex.test(content)) type = 'support';
          else if (deriveRegex.test(content)) type = 'derive';

          // 避免重复建立相同目标的链路
          if (!node.links.some(l => l.targetId === targetNode.note.id)) {
            node.links.push({ targetId: targetNode.note.id, type });
            targetNode.linkedByNodeIds.push(node.note.id);
          }
        }
      });
    });

    // 计算质量跃迁 (Node Mass)
    nodes.forEach(node => {
      const totalConnections = node.links.length + node.linkedByNodeIds.length;
      node.radius = 5 + (totalConnections * 2.5); 
    });

    nodesRef.current = nodes;

    if (cameraRef.current.x === 0 && cameraRef.current.y === 0) {
      cameraRef.current = { x: 0, y: 0, scale: 0.8 };
      centerCamera();
    }
  };

  const centerCamera = () => {
    cameraRef.current.x = window.innerWidth / 2 * (1 - cameraRef.current.scale);
    cameraRef.current.y = window.innerHeight / 2 * (1 - cameraRef.current.scale);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;
    let bgStars: Array<{ x: number; y: number; size: number; alpha: number; speed: number }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bgStars = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        alpha: Math.random(),
        speed: 0.002 + Math.random() * 0.005
      }));
    };

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bgStars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.1) s.speed = -s.speed;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha * 0.5)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      ctx.save(); // 保存绝对屏幕坐标系
      const { x: camX, y: camY, scale: camScale } = cameraRef.current;
      ctx.translate(camX, camY);
      ctx.scale(camScale, camScale);

      const nodes = nodesRef.current;
      let currentHovered: PlanetNode | null = null;
      const mouseWorldX = (mouseRef.current.x - camX) / camScale;
      const mouseWorldY = (mouseRef.current.y - camY) / camScale;

      nodes.forEach(node => {
        node.pulse += node.pulseSpeed;
        
        if (draggedNodeRef.current === node) {
          node.x = mouseWorldX;
          node.y = mouseWorldY;
          currentHovered = node;
        } else {
          node.angle += node.orbitSpeed;
          node.x = node.targetX + Math.cos(node.angle) * node.orbitRadius;
          node.y = node.targetY + Math.sin(node.angle) * node.orbitRadius;
        }

        const distToMouse = Math.hypot(node.x - mouseWorldX, node.y - mouseWorldY);
        if (!isDraggingCameraRef.current && (!draggedNodeRef.current || draggedNodeRef.current === node)) {
          if (distToMouse < node.radius + 10) {
            currentHovered = node;
          }
        }
      });

      let focusNode: PlanetNode | null = null;
      if (draggedNodeRef.current) focusNode = draggedNodeRef.current;
      else if (currentHovered) focusNode = currentHovered;
      else if (selectedNodeIdRef.current) {
        focusNode = nodes.find(n => n.note.id === selectedNodeIdRef.current) || null;
      }

      const activeNetworkIds = new Set<number>();
      if (focusNode) {
        activeNetworkIds.add(focusNode.note.id);
        focusNode.links.forEach(l => activeNetworkIds.add(l.targetId));
        focusNode.linkedByNodeIds.forEach(id => activeNetworkIds.add(id));
      }

      nodes.forEach(node => {
        const targetAlpha = focusNode ? (activeNetworkIds.has(node.note.id) ? 1.0 : 0.08) : 1.0;
        node.currentAlpha += (targetAlpha - node.currentAlpha) * 0.1; 
      });

      // 1. 绘制底层静态背景拓扑
      ctx.lineWidth = 0.5 / camScale;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].note.category === nodes[j].note.category) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (dist < 220) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              const baseAlpha = (1 - dist / 220) * 0.08;
              ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * Math.min(nodes[i].currentAlpha, nodes[j].currentAlpha)})`;
              ctx.stroke();
            }
          }
        }
      }

      // 2. 绘制多模式语义链路与高能脉冲粒子 (Pulse Flows)
      nodes.forEach(node => {
        node.links.forEach(link => {
          const targetNode = nodes.find(n => n.note.id === link.targetId);
          if (!targetNode) return;

          const isHighlight = focusNode?.note.id === node.note.id || focusNode?.note.id === targetNode.note.id;
          const jointAlpha = Math.min(node.currentAlpha, targetNode.currentAlpha);
          const baseAlpha = isHighlight ? 0.8 : 0.25 * jointAlpha;

          let linkColor = `rgba(139, 92, 246, ${baseAlpha})`;       // normal: 紫色
          let particleColor = '#D946EF';
          if (link.type === 'derive') {
            linkColor = `rgba(236, 72, 153, ${baseAlpha})`;       // derive: 玫红
            particleColor = '#F472B6';
          } else if (link.type === 'support') {
            linkColor = `rgba(16, 185, 129, ${baseAlpha})`;      // support: 翡翠绿
            particleColor = '#34D399';
          } else if (link.type === 'conflict') {
            const flash = 0.4 + Math.sin(frameCount * 0.2) * 0.3;
            linkColor = `rgba(239, 68, 68, ${isHighlight ? flash : flash * jointAlpha})`; // conflict: 警告红
            particleColor = '#FCA5A5';
          }

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.strokeStyle = linkColor;
          ctx.lineWidth = (link.type !== 'normal' && isHighlight ? 2 : 1) / camScale;
          if (link.type === 'conflict') ctx.setLineDash([4 / camScale, 4 / camScale]);
          ctx.stroke();
          ctx.setLineDash([]);

          if (baseAlpha > 0.05) {
            const particleCount = link.type === 'normal' ? 1 : 2;
            const distance = Math.hypot(targetNode.x - node.x, targetNode.y - node.y);
            
            for (let p = 0; p < particleCount; p++) {
              const speedModifier = link.type === 'derive' ? 1.5 : link.type === 'conflict' ? 2.2 : 1.0;
              const progress = ((frameCount * 0.005 * speedModifier) + (p / particleCount)) % 1;
              
              const pX = node.x + (targetNode.x - node.x) * progress;
              const pY = node.y + (targetNode.y - node.y) * progress;

              ctx.beginPath();
              ctx.arc(pX, pY, (isHighlight ? 3.5 : 2) / camScale, 0, Math.PI * 2);
              ctx.fillStyle = particleColor;
              
              ctx.shadowColor = particleColor;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0; 
            }
          }
        });
      });

      // 3. 渲染物理星球核心
      nodes.forEach(node => {
        let currentRadius = node.radius + Math.sin(node.pulse) * 1.5;
        const isHovered = focusNode?.note.id === node.note.id;

        ctx.globalAlpha = node.currentAlpha;

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * (isHovered ? 3 : 2), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? node.glowColor.replace('0.4', '0.7') : node.glowColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2 / camScale;
        ctx.stroke();
        
        ctx.globalAlpha = 1.0; 
      });

      // 🚨 关键修复点：在这里提前释放世界坐标系矩阵！
      // 保证后续的黑洞和 HUD 渲染在固定的屏幕绝对坐标上
      ctx.restore();

      // 4. 黑洞引力场 (基于屏幕绝对坐标)
      const bhX = canvas.width - 180; // 从 100 增加到 180
      const bhY = canvas.height - 180; // 从 100 增加到 180
      const bhBaseRadius = 30;
      
      const distToBlackHole = Math.hypot(mouseRef.current.x - bhX, mouseRef.current.y - bhY);
      const isBlackHoleHovered = draggedNodeRef.current && distToBlackHole < bhBaseRadius + 50;
      const activeBhRadius = isBlackHoleHovered ? bhBaseRadius * 1.5 : bhBaseRadius;

      ctx.save();
      ctx.translate(bhX, bhY);
      ctx.rotate(frameCount * (isBlackHoleHovered ? 0.1 : 0.02));
      
      ctx.beginPath();
      ctx.arc(0, 0, activeBhRadius, 0, Math.PI * 2);
      const bhGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, activeBhRadius);
      bhGrad.addColorStop(0, '#000000');
      bhGrad.addColorStop(0.6, '#000000');
      bhGrad.addColorStop(0.9, isBlackHoleHovered ? '#EF4444' : '#8B5CF6'); 
      bhGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bhGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 0, activeBhRadius * 1.8, activeBhRadius * 0.6, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isBlackHoleHovered ? 'rgba(239, 68, 68, 0.8)' : 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = isBlackHoleHovered ? 3 : 1;
      ctx.stroke();
      ctx.restore();

      // 5. HUD 文本渲染 (也是基于屏幕绝对坐标)
      mouseRef.current.hoveredNode = currentHovered;
      if (currentHovered && !isDraggingCameraRef.current) {
        const n = currentHovered as PlanetNode;
        canvas.style.cursor = draggedNodeRef.current ? 'grabbing' : 'pointer';

        // 动态计算世界坐标到屏幕坐标的映射，保证跟随行星
        const screenX = n.x * camScale + camX;
        const screenY = n.y * camScale + camY;
        const screenRadius = n.radius * camScale;

        const totalLinks = n.links.length + n.linkedByNodeIds.length;
        const hudText = isBlackHoleHovered 
          ? `⚠️ DELETING: ${n.cleanTitle}`
          : (totalLinks > 0 ? `${n.cleanTitle} [🔗 ${totalLinks}]` : n.cleanTitle);

        ctx.beginPath();
        ctx.arc(screenX, screenY, screenRadius + 16, 0, Math.PI * 2);
        ctx.strokeStyle = isBlackHoleHovered ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]); 

        ctx.font = 'bold 12px monospace';
        const textWidth = ctx.measureText(hudText).width;

        ctx.fillStyle = isBlackHoleHovered ? 'rgba(69, 10, 10, 0.9)' : 'rgba(10, 10, 12, 0.9)';
        ctx.strokeStyle = isBlackHoleHovered ? '#EF4444' : n.color;
        ctx.lineWidth = 1;
        
        const boxX = screenX + screenRadius + 15;
        const boxY = screenY - 30;
        
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(boxX, boxY + 13);
        ctx.strokeStyle = isBlackHoleHovered ? '#EF4444' : n.color;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(boxX, boxY, textWidth + 24, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isBlackHoleHovered ? '#FECACA' : '#FFFFFF';
        ctx.fillText(hudText, boxX + 12, boxY + 17);
      } else {
        canvas.style.cursor = isDraggingCameraRef.current ? 'grabbing' : 'grab';
      }

      // 注意这里没有 ctx.restore() 了
      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseDown = (e: MouseEvent) => {
      hasMovedRef.current = false;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      if (mouseRef.current.hoveredNode) {
        draggedNodeRef.current = mouseRef.current.hoveredNode;
        return; 
      }
      isDraggingCameraRef.current = true;
      lastCameraRef.current = { ...cameraRef.current };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMovedRef.current = true;
      }

      if (isDraggingCameraRef.current) {
        cameraRef.current.x = lastCameraRef.current.x + dx;
        cameraRef.current.y = lastCameraRef.current.y + dy;
      }
    };

    const handleMouseUp = () => {
      if (draggedNodeRef.current) {
        const bhX = canvas.width - 100;
        const bhY = canvas.height - 100;
        // 黑洞引力判定区
        const distToBh = Math.hypot(mouseRef.current.x - bhX, mouseRef.current.y - bhY);
        
        if (distToBh < 80) {
          handleDelete(draggedNodeRef.current.note.id);
        }
        draggedNodeRef.current = null;
      }
      isDraggingCameraRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomIntensity = 0.001;
      const delta = -e.deltaY * zoomIntensity;
      
      let newScale = cameraRef.current.scale * Math.exp(delta);
      newScale = Math.max(0.15, Math.min(newScale, 3)); 

      const worldX = (mouseX - cameraRef.current.x) / cameraRef.current.scale;
      const worldY = (mouseY - cameraRef.current.y) / cameraRef.current.scale;

      cameraRef.current.x = mouseX - worldX * newScale;
      cameraRef.current.y = mouseY - worldY * newScale;
      cameraRef.current.scale = newScale;
    };

    const handleCanvasClick = () => {
      if (!isDraggingCameraRef.current && !hasMovedRef.current && mouseRef.current.hoveredNode) {
        setSelectedNote(mouseRef.current.hoveredNode.note);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleCanvasClick);
    
    resizeCanvas();
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [notes]);

  const handleDelete = async (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    nodesRef.current = nodesRef.current.filter(n => n.note.id !== id);
    setSelectedNote(null);
    toast.success('Star core collapsed successfully into the singularity');

    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast.error('Erase matrix failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070709] overflow-hidden select-none z-40">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" />

      {/* 控制台与状态面板 */}
      <div className="absolute top-6 left-6 pointer-events-auto space-y-2 z-50">
        <Link href="/" className="inline-flex items-center text-xs font-mono font-bold text-gray-400 hover:text-blue-400 transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          ← TERMINAL DASHBOARD
        </Link>
        <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 font-mono">
          MAKO OMNI-GALAXY
        </h1>
        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center space-x-2">
          <span>Viewport Active</span>
          <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse ml-2" />
          <span className="text-purple-500">Semantic Links Streaming</span>
        </p>
      </div>

      <div className="absolute bottom-6 left-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono border border-white/5 bg-black/40 backdrop-blur-md p-4 rounded-xl z-50 pointer-events-none">
        <div className="flex items-center space-x-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> <span>🧠 Knowledge ({notes.filter(n=>n.category==='learning').length})</span></div>
        <div className="flex items-center space-x-2 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/> <span>💼 Operation ({notes.filter(n=>n.category==='work').length})</span></div>
        <div className="flex items-center space-x-2 text-teal-400"><span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"/> <span>🌿 Biometrics ({notes.filter(n=>n.category==='life').length})</span></div>
        <div className="flex items-center space-x-2 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"/> <span>🎮 Simulation ({notes.filter(n=>n.category==='entertainment').length})</span></div>
      </div>

      {/* 语义连线图例 HUD */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-1.5 text-[10px] font-mono border border-white/5 bg-black/40 backdrop-blur-md p-3 rounded-xl z-50 pointer-events-none">
        <div className="text-gray-500 mb-0.5 uppercase tracking-wider">Flow Spectrum</div>
        <div className="flex items-center space-x-2 text-pink-400"><div className="w-4 h-0.5 bg-pink-500"/> <span>➔ DERIVE (递进)</span></div>
        <div className="flex items-center space-x-2 text-emerald-400"><div className="w-4 h-0.5 bg-emerald-500"/> <span>➔ SUPPORT (证实)</span></div>
        <div className="flex items-center space-x-2 text-red-400"><div className="w-4.5 h-0.5 border-t border-dashed border-red-500"/> <span>⤳ CONFLICT (反思)</span></div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/80 space-y-3 z-50 pointer-events-none">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="text-xs font-mono text-purple-400 tracking-widest animate-pulse">STREAMING NEURAL FLOWS...</span>
        </div>
      )}

      {selectedNote && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-fade-in pointer-events-auto" onClick={() => setSelectedNote(null)}>
          <div className="w-full max-w-lg bg-[#121215]/95 border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`absolute top-0 left-0 w-full h-[3px] ${
              selectedNote.category === 'learning' ? 'bg-emerald-500' : selectedNote.category === 'work' ? 'bg-indigo-500' : selectedNote.category === 'life' ? 'bg-teal-500' : 'bg-orange-500'
            }`} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded">
                  🪐 Orbit Core // {selectedNote.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{selectedNote.title.replace('🔤 ', '').replace('[Word] ', '')}</h2>
              </div>
              <button onClick={() => setSelectedNote(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-colors">✕</button>
            </div>
            <div className="text-sm leading-relaxed text-gray-300 max-h-[300px] overflow-y-auto pr-2 font-sans prose prose-invert max-w-none border-t border-b border-white/5 py-4 my-4 scrollbar-thin">
              <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-gray-500 pt-1">
              <span>🛰️ TELEMETRY: {new Date(selectedNote.inserted_at).toLocaleDateString()}</span>
              <button onClick={() => handleDelete(selectedNote.id)} className="text-red-400/80 hover:text-red-400 font-bold tracking-wide transition-colors uppercase text-[11px]">Collapse Node</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
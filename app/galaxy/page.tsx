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
  
  // 🌟 新增功能 A：创世表单状态
  const [createForm, setCreateForm] = useState<{ x: number, y: number, worldX: number, worldY: number } | null>(null);
  const [newNoteData, setNewNoteData] = useState({ title: '', content: '', category: 'learning' as AppCategory });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 新增功能 B：雷达搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<PlanetNode[]>([]);
  
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });
  // 用于平滑推进的镜头目标
  const cameraTargetRef = useRef<{ x: number, y: number, scale: number } | null>(null);
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

    const oldNodes = nodesRef.current;

    const nodes: PlanetNode[] = rawNotes.map((note, index) => {
      // ✅ 状态保留：如果在原星系中已存在，保留它的物理坐标，防止乱跳
      const oldNode = oldNodes.find(n => n.note.id === note.id);
      const cleanTitle = note.title.replace('🔤 ', '').replace('[Word] ', '').trim();

      if (oldNode) {
        return { ...oldNode, note, cleanTitle, links: [], linkedByNodeIds: [] };
      }

      const center = centers[note.category] || { x: baseWidth / 2, y: baseHeight / 2, color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' };
      const orbitRadius = 60 + (index % 8) * 40 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;

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

    nodes.forEach(node => {
      nodes.forEach(targetNode => {
        if (node.note.id === targetNode.note.id || targetNode.cleanTitle.length <= 1) return;
        const content = node.note.content;
        const titleEscaped = targetNode.cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const deriveRegex = new RegExp(`(->|递进|衍生|演化)\\s*.*?${titleEscaped}`, 'i');
        const supportRegex = new RegExp(`(\\+|支持|证实|协同)\\s*.*?${titleEscaped}`, 'i');
        const conflictRegex = new RegExp(`(-|冲突|反对|反思)\\s*.*?${titleEscaped}`, 'i');

        if (content.includes(targetNode.cleanTitle)) {
          let type: LinkType = 'normal';
          if (conflictRegex.test(content)) type = 'conflict';
          else if (supportRegex.test(content)) type = 'support';
          else if (deriveRegex.test(content)) type = 'derive';

          if (!node.links.some(l => l.targetId === targetNode.note.id)) {
            node.links.push({ targetId: targetNode.note.id, type });
            targetNode.linkedByNodeIds.push(node.note.id);
          }
        }
      });
    });

    nodes.forEach(node => {
      const totalConnections = node.links.length + node.linkedByNodeIds.length;
      node.radius = 5 + (totalConnections * 2.5); 
    });

    nodesRef.current = nodes;

    if (cameraRef.current.x === 0 && cameraRef.current.y === 0 && oldNodes.length === 0) {
      cameraRef.current = { x: 0, y: 0, scale: 0.8 };
      centerCamera();
    }
  };

  const centerCamera = () => {
    cameraRef.current.x = window.innerWidth / 2 * (1 - cameraRef.current.scale);
    cameraRef.current.y = window.innerHeight / 2 * (1 - cameraRef.current.scale);
  };

  // 🎯 功能 B：触发雷达平移运镜
  const focusOnNode = (id: number) => {
    const node = nodesRef.current.find(n => n.note.id === id);
    if (!node) return;
    
    const targetScale = 1.5; // 放大系数
    const targetX = window.innerWidth / 2 - node.x * targetScale;
    const targetY = window.innerHeight / 2 - node.y * targetScale;
    
    cameraTargetRef.current = { x: targetX, y: targetY, scale: targetScale };
    setSearchQuery(''); // 选中后清空搜索
  };

  // 📝 功能 A：提交新星球
  const handleCreateSubmit = async () => {
    if (!newNoteData.title || !newNoteData.content) {
      toast.error('Title and core data cannot be void');
      return;
    }
    setIsSubmitting(true);
    
    const { data, error } = await supabase.from('notes').insert([
      { title: newNoteData.title, content: newNoteData.content, category: newNoteData.category }
    ]).select().single();

    if (error || !data) {
      toast.error('Failed to ignite star');
      setIsSubmitting(false);
      return;
    }

    // 预埋物理坐标，让星系刷新时星球直接出现在双击的位置
    const tempNode = { ...data, cleanTitle: data.title } as any;
    nodesRef.current.push({
      note: data as Note, cleanTitle: data.title, links: [], linkedByNodeIds: [], currentAlpha: 1,
      x: createForm!.worldX, y: createForm!.worldY, targetX: createForm!.worldX, targetY: createForm!.worldY,
      radius: 5, color: '#ffffff', glowColor: '#ffffff', angle: 0, orbitRadius: 0, orbitSpeed: 0, pulse: 0, pulseSpeed: 0
    });

    setNotes([data as Note, ...notes]);
    setCreateForm(null);
    setNewNoteData({ title: '', content: '', category: 'learning' });
    toast.success('Star ignited successfully');
    setIsSubmitting(false);
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

      // 🎥 镜头平滑插值 (Camera Smoothing Interpolation)
      if (cameraTargetRef.current && !isDraggingCameraRef.current) {
        cameraRef.current.x += (cameraTargetRef.current.x - cameraRef.current.x) * 0.08;
        cameraRef.current.y += (cameraTargetRef.current.y - cameraRef.current.y) * 0.08;
        cameraRef.current.scale += (cameraTargetRef.current.scale - cameraRef.current.scale) * 0.08;
        
        const dx = Math.abs(cameraTargetRef.current.x - cameraRef.current.x);
        const dy = Math.abs(cameraTargetRef.current.y - cameraRef.current.y);
        const ds = Math.abs(cameraTargetRef.current.scale - cameraRef.current.scale);
        if (dx < 0.5 && dy < 0.5 && ds < 0.01) cameraTargetRef.current = null; // 到达目标
      }

      bgStars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.1) s.speed = -s.speed;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha * 0.5)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      ctx.save();
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
          // 如果正在被创建，先固定在原位
          if (node.orbitSpeed !== 0) {
            node.angle += node.orbitSpeed;
            node.x = node.targetX + Math.cos(node.angle) * node.orbitRadius;
            node.y = node.targetY + Math.sin(node.angle) * node.orbitRadius;
          }
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

      const sq = searchQuery.toLowerCase();

      nodes.forEach(node => {
        let targetAlpha = 1.0;
        
        // 🚨 雷达搜索模式 Alpha 判定
        if (sq) {
          const isMatch = node.note.title.toLowerCase().includes(sq) || node.note.content.toLowerCase().includes(sq);
          targetAlpha = isMatch ? 1.0 : 0.05; // 不匹配的进入暗物质状态
        } else if (focusNode) {
          targetAlpha = activeNetworkIds.has(node.note.id) ? 1.0 : 0.08;
        }

        node.currentAlpha += (targetAlpha - node.currentAlpha) * 0.1; 
      });

      // 1. 底层连线
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

      // 2. 语义脉冲
      nodes.forEach(node => {
        if (node.currentAlpha < 0.1 && !sq) return; // 优化性能
        node.links.forEach(link => {
          const targetNode = nodes.find(n => n.note.id === link.targetId);
          if (!targetNode) return;

          const isHighlight = focusNode?.note.id === node.note.id || focusNode?.note.id === targetNode.note.id;
          const jointAlpha = Math.min(node.currentAlpha, targetNode.currentAlpha);
          const baseAlpha = isHighlight ? 0.8 : 0.25 * jointAlpha;

          let linkColor = `rgba(139, 92, 246, ${baseAlpha})`;
          let particleColor = '#D946EF';
          if (link.type === 'derive') { linkColor = `rgba(236, 72, 153, ${baseAlpha})`; particleColor = '#F472B6'; }
          else if (link.type === 'support') { linkColor = `rgba(16, 185, 129, ${baseAlpha})`; particleColor = '#34D399'; }
          else if (link.type === 'conflict') {
            const flash = 0.4 + Math.sin(frameCount * 0.2) * 0.3;
            linkColor = `rgba(239, 68, 68, ${isHighlight ? flash : flash * jointAlpha})`;
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
            const progress = ((frameCount * 0.005) % 1);
            const pX = node.x + (targetNode.x - node.x) * progress;
            const pY = node.y + (targetNode.y - node.y) * progress;
            ctx.beginPath();
            ctx.arc(pX, pY, (isHighlight ? 3.5 : 2) / camScale, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
          }
        });
      });

      // 3. 星体渲染
      nodes.forEach(node => {
        let currentRadius = node.radius + Math.sin(node.pulse) * 1.5;
        const isHovered = focusNode?.note.id === node.note.id;
        
        // 雷达匹配高亮特效
        const isRadarMatch = sq && (node.note.title.toLowerCase().includes(sq) || node.note.content.toLowerCase().includes(sq));

        ctx.globalAlpha = node.currentAlpha;

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * (isHovered || isRadarMatch ? 3 : 2), 0, Math.PI * 2);
        ctx.fillStyle = isRadarMatch ? 'rgba(234, 179, 8, 0.6)' : (isHovered ? node.glowColor.replace('0.4', '0.7') : node.glowColor);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = isRadarMatch ? '#FEF08A' : '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2 / camScale;
        ctx.stroke();
        
        ctx.globalAlpha = 1.0; 
      });

      ctx.restore();

      // 4. 黑洞 (修复位置)
      const bhX = canvas.width - 180;
      const bhY = canvas.height - 180;
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

      // 5. HUD 文本
      mouseRef.current.hoveredNode = currentHovered;
      if (currentHovered && !isDraggingCameraRef.current) {
        const n = currentHovered as PlanetNode;
        canvas.style.cursor = draggedNodeRef.current ? 'grabbing' : 'pointer';

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
        
        const boxX = screenX + screenRadius + 15;
        const boxY = screenY - 30;
        
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(boxX, boxY + 13);
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

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (createForm) return; // 如果正在创建，禁用拖拽
      hasMovedRef.current = false;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      if (mouseRef.current.hoveredNode) {
        draggedNodeRef.current = mouseRef.current.hoveredNode;
        return; 
      }
      isDraggingCameraRef.current = true;
      cameraTargetRef.current = null; // 打断自动运镜
      lastCameraRef.current = { ...cameraRef.current };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMovedRef.current = true;

      if (isDraggingCameraRef.current) {
        cameraRef.current.x = lastCameraRef.current.x + dx;
        cameraRef.current.y = lastCameraRef.current.y + dy;
      }
    };

    const handleMouseUp = () => {
      if (draggedNodeRef.current) {
        const bhX = canvas.width - 180;
        const bhY = canvas.height - 180;
        if (Math.hypot(mouseRef.current.x - bhX, mouseRef.current.y - bhY) < 80) {
          handleDelete(draggedNodeRef.current.note.id);
        }
        draggedNodeRef.current = null;
      }
      isDraggingCameraRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (createForm) return;
      e.preventDefault();
      cameraTargetRef.current = null; // 滚轮打断自动运镜
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = -e.deltaY * 0.001;
      
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
        setCreateForm(null); // 点击星球关闭创建表单
      } else if (!hasMovedRef.current && !mouseRef.current.hoveredNode) {
         setCreateForm(null); // 点击空白关闭表单
      }
    };

    // 🎯 新增：双击触发创世
    const handleDoubleClick = (e: MouseEvent) => {
      if (mouseRef.current.hoveredNode) return;
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const worldX = (screenX - cameraRef.current.x) / cameraRef.current.scale;
      const worldY = (screenY - cameraRef.current.y) / cameraRef.current.scale;
      
      setCreateForm({ x: screenX, y: screenY, worldX, worldY });
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    resizeCanvas();
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [notes, createForm, searchQuery]);

  const handleDelete = async (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    nodesRef.current = nodesRef.current.filter(n => n.note.id !== id);
    setSelectedNote(null);
    toast.success('Star core collapsed successfully');

    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) toast.error('Erase matrix failed');
  };

  const searchedNotes = searchQuery.length > 0 ? notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <div className="fixed inset-0 bg-[#070709] overflow-hidden select-none z-40 font-mono">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" />

      {/* 控制台与雷达搜索 */}
      <div className="absolute top-24 left-6 pointer-events-auto flex items-center space-x-6 z-50">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-blue-400 transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            ← TERMINAL
          </Link>
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">MAKO OMNI-GALAXY</h1>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase flex items-center">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse mr-2" />
            Double-Click Void to Create
          </p>
        </div>

        {/* 📡 雷达搜索框 */}
        <div className="relative w-64 pt-1">
          <input
            type="text"
            placeholder="Radar Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:border-yellow-500/50 backdrop-blur-md transition-all placeholder:text-gray-600"
          />
          {searchQuery && (
            <div className="absolute top-full mt-2 w-full max-h-64 overflow-y-auto bg-black/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md p-2 scrollbar-thin">
              {searchedNotes.length === 0 ? (
                <div className="text-xs text-gray-500 p-2 text-center">No stars matched</div>
              ) : (
                searchedNotes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => focusOnNode(n.id)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors truncate"
                  >
                    <span className="text-yellow-500 mr-2">⌖</span>{n.title.replace('🔤 ', '').replace('[Word] ', '')}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 A：虚空创星表单层 */}
      {createForm && (
        <div 
          className="absolute z-50 pointer-events-auto"
          style={{ left: createForm.x, top: createForm.y, transform: 'translate(-50%, -50%)' }}
          onClick={(e) => e.stopPropagation()} // 防止点击穿透触发关闭
        >
          <div className="w-64 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative animate-fade-in">
             {/* 中心十字准星装饰 */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white/30 text-xs">⌖</div>
            
            <input 
              autoFocus
              placeholder="Star Title..." 
              value={newNoteData.title}
              onChange={e => setNewNoteData({...newNoteData, title: e.target.value})}
              className="w-full bg-transparent text-white font-bold text-sm border-b border-white/10 pb-1 mb-3 focus:outline-none focus:border-blue-500"
            />
            <textarea 
              placeholder="Core Data (Markdown)..." 
              value={newNoteData.content}
              onChange={e => setNewNoteData({...newNoteData, content: e.target.value})}
              className="w-full h-24 bg-white/5 rounded-lg text-gray-300 text-xs p-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none scrollbar-thin"
            />
            <div className="flex space-x-2">
              <select 
                value={newNoteData.category}
                onChange={e => setNewNoteData({...newNoteData, category: e.target.value as AppCategory})}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-300 px-2 outline-none"
              >
                <option value="learning" className="bg-black text-emerald-400">Learning</option>
                <option value="work" className="bg-black text-indigo-400">Work</option>
                <option value="life" className="bg-black text-teal-400">Life</option>
                <option value="entertainment" className="bg-black text-orange-400">Entertainment</option>
              </select>
              <button 
                onClick={handleCreateSubmit}
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
              >
                IGNITE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部与右侧图例（保持原样） */}
      <div className="absolute bottom-6 left-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] border border-white/5 bg-black/40 backdrop-blur-md p-4 rounded-xl z-50 pointer-events-none">
        <div className="flex items-center space-x-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> <span>🧠 Knowledge ({notes.filter(n=>n.category==='learning').length})</span></div>
        <div className="flex items-center space-x-2 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/> <span>💼 Operation ({notes.filter(n=>n.category==='work').length})</span></div>
        <div className="flex items-center space-x-2 text-teal-400"><span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"/> <span>🌿 Biometrics ({notes.filter(n=>n.category==='life').length})</span></div>
        <div className="flex items-center space-x-2 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"/> <span>🎮 Simulation ({notes.filter(n=>n.category==='entertainment').length})</span></div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col space-y-1.5 text-[10px] border border-white/5 bg-black/40 backdrop-blur-md p-3 rounded-xl z-50 pointer-events-none">
        <div className="text-gray-500 mb-0.5 uppercase tracking-wider">Flow Spectrum</div>
        <div className="flex items-center space-x-2 text-pink-400"><div className="w-4 h-0.5 bg-pink-500"/> <span>➔ DERIVE (递进)</span></div>
        <div className="flex items-center space-x-2 text-emerald-400"><div className="w-4 h-0.5 bg-emerald-500"/> <span>➔ SUPPORT (证实)</span></div>
        <div className="flex items-center space-x-2 text-red-400"><div className="w-4.5 h-0.5 border-t border-dashed border-red-500"/> <span>⤳ CONFLICT (反思)</span></div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/80 space-y-3 z-50 pointer-events-none">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="text-xs text-purple-400 tracking-widest animate-pulse">STREAMING NEURAL FLOWS...</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
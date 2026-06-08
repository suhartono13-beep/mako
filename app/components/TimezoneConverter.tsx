'use client';

import React, { useState, useEffect } from 'react';

// 预设的可选时区库
const AVAILABLE_ZONES = [
  { id: 'Asia/Shanghai', label: '北京 / 中国', icon: '🇨🇳' },
  { id: 'America/New_York', label: '纽约 / 美国', icon: '🇺🇸' },
  { id: 'America/Los_Angeles', label: '洛杉矶 / 美国', icon: '🇺🇸' },
  { id: 'Europe/London', label: '伦敦 / 英国', icon: '🇬🇧' },
  { id: 'Europe/Paris', label: '巴黎 / 法国', icon: '🇫🇷' },
  { id: 'Asia/Tokyo', label: '东京 / 日本', icon: '🇯🇵' },
  { id: 'Australia/Sydney', label: '悉尼 / 澳大利亚', icon: '🇦🇺' },
  { id: 'Asia/Dubai', label: '迪拜 / 阿联酋', icon: '🇦🇪' },
];

export default function TimezoneConverter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeZones, setActiveZones] = useState<string[]>(['Asia/Shanghai', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [isEditing, setIsEditing] = useState(false);

  // 实时时钟更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 本地存储同步
  useEffect(() => {
    const saved = localStorage.getItem('mako-timezone-zones');
    if (saved) {
      try { setActiveZones(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mako-timezone-zones', JSON.stringify(activeZones));
  }, [activeZones]);

  const toggleZone = (zoneId: string) => {
    if (activeZones.includes(zoneId)) {
      if (activeZones.length <= 1) return; // 至少保留一个
      setActiveZones(activeZones.filter(id => id !== zoneId));
    } else {
      setActiveZones([...activeZones, zoneId]);
    }
  };

  // 格式化时间的辅助函数
  const formatTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  const formatDate = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };

  // 计算与本地的相对时差
  const getOffsetString = (timeZone: string) => {
    const localDate = new Date();
    const tzDateString = new Date(localDate.toLocaleString('en-US', { timeZone }));
    const diffHours = (tzDateString.getTime() - localDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours === 0) return '本地时间';
    const sign = diffHours > 0 ? '+' : '';
    return `${sign}${Math.round(diffHours)} 小时`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      {/* 顶部控制台 */}
      <div className="absolute top-4 right-6 z-10">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all border ${
            isEditing 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          {isEditing ? '✓ 完成配置' : '⚙️ 管理城市'}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Global Biometrics Sync</h2>
        <p className="text-xs text-slate-400 mt-1">实时追踪你在不同象限的时间坐标</p>
      </div>

      {isEditing && (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 mb-3">选择要在仪表盘显示的城市：</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ZONES.map(zone => (
              <button
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  activeZones.includes(zone.id)
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {zone.icon} {zone.label.split(' / ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 时钟矩阵卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeZones.map(zoneId => {
          const zoneInfo = AVAILABLE_ZONES.find(z => z.id === zoneId) || { label: zoneId, icon: '🌐' };
          const timeString = formatTime(currentTime, zoneId);
          const dateString = formatDate(currentTime, zoneId);
          const offsetString = getOffsetString(zoneId);

          return (
            <div key={zoneId} className="relative p-5 bg-white border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md rounded-2xl transition-all group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{zoneInfo.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${offsetString === '本地时间' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  {offsetString}
                </span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-500">{zoneInfo.label}</h3>
                <div className="text-3xl font-mono font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {timeString}
                </div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                  {dateString}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { Emotion } from '../types';
import { Heart, Zap, AlertTriangle, HelpCircle, Coffee, Smile, Star, Brain } from 'lucide-react';

interface VibePanelProps {
  currentEmotion: Emotion;
  history: { emotion: Emotion; timestamp: number }[];
  isVisible: boolean;
}

export const VibePanel: React.FC<VibePanelProps> = ({ currentEmotion, history, isVisible }) => {
  if (!isVisible) return null;

  const getEmotionMeta = (emotion: Emotion) => {
    switch (emotion) {
      case 'HAPPY':
      case 'EXCITED':
        return { 
          color: 'text-emerald-400', 
          hex: 'rgba(16, 185, 129, 0.5)',
          bg: 'bg-emerald-500/5', 
          border: 'border-emerald-500/30',
          label: 'User Delight',
          icon: <Smile size={28} />
        };
      case 'ANGRY':
      case 'FRUSTRATED':
        return { 
          color: 'text-rose-500', 
          hex: 'rgba(244, 63, 94, 0.5)',
          bg: 'bg-rose-500/5', 
          border: 'border-rose-500/30',
          label: 'Critical Friction',
          icon: <AlertTriangle size={28} />
        };
      case 'IMPATIENT':
        return { 
          color: 'text-amber-500', 
          hex: 'rgba(245, 158, 11, 0.5)',
          bg: 'bg-amber-500/5', 
          border: 'border-amber-500/30',
          label: 'Urgency Detected',
          icon: <Zap size={28} />
        };
      case 'CONFUSED':
        return { 
          color: 'text-sky-400', 
          hex: 'rgba(56, 189, 248, 0.5)',
          bg: 'bg-sky-400/5', 
          border: 'border-sky-400/30',
          label: 'Cognitive Load',
          icon: <HelpCircle size={28} />
        };
      case 'BORED':
        return { 
          color: 'text-slate-400', 
          hex: 'rgba(148, 163, 184, 0.5)',
          bg: 'bg-slate-400/5', 
          border: 'border-slate-400/30',
          label: 'Low Interest',
          icon: <Coffee size={28} />
        };
      default:
        return { 
          color: 'text-purple-400', 
          hex: 'rgba(168, 85, 247, 0.5)',
          bg: 'bg-purple-500/5', 
          border: 'border-purple-500/30',
          label: 'Stable Baseline',
          icon: <Star size={28} />
        };
    }
  };

  const meta = getEmotionMeta(currentEmotion);

  return (
    <aside className="w-80 glass border-l border-white/5 flex flex-col overflow-hidden z-20">
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-10">
          <Brain size={16} className="text-purple-400" />
          <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Neural State Analysis</h3>
        </div>
        
        {/* Live Emotion Display */}
        <div 
          className={`relative p-10 rounded-[2.5rem] ${meta.bg} border ${meta.border} mb-12 transition-all duration-700 flex flex-col items-center text-center group`}
          style={{ boxShadow: `0 0 50px ${meta.hex}` }}
        >
          <div className={`mb-5 transition-all duration-500 group-hover:scale-125 ${meta.color}`}>
            {meta.icon}
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Simulation State</p>
          <div className={`text-4xl font-black tracking-tighter ${meta.color} mb-5 uppercase`}>
            {currentEmotion}
          </div>
          <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${meta.color} border-current/20 bg-current/10 shadow-lg`}>
            {meta.label}
          </div>
        </div>

        {/* Sentiment Log */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Sentiment Timeline</h4>
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
               <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
               <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{history.length} Events</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
            {history.slice().reverse().map((h, i) => {
              const hMeta = getEmotionMeta(h.emotion);
              return (
                <div key={i} className="relative pl-6 group">
                  <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-white/5"></div>
                  <div className={`absolute left-0 top-[22px] w-2 h-2 rounded-full ring-4 ring-[#131314] transition-all group-hover:scale-125 ${hMeta.color.replace('text', 'bg')}`}></div>
                  
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[11px] font-black ${hMeta.color} uppercase tracking-[0.1em]`}>{h.emotion}</p>
                      <p className="text-[9px] text-slate-600 font-bold">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <Heart size={48} className="mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Collecting behavioral data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
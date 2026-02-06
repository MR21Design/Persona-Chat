import React from 'react';
import { ChatSession } from '../types';
import { MessageSquare, Plus, Home, History, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  sessions, 
  currentSessionId, 
  setCurrentSessionId,
  onNewChat 
}) => {
  return (
    <aside 
      className={`transition-all duration-300 glass flex flex-col border-r border-white/5 z-30 overflow-hidden ${isOpen ? 'w-72' : 'w-0 border-none'}`}
    >
      <div className="flex flex-col h-full min-w-[288px]">
        {/* Header/Logo alignment with Header.tsx toggle */}
        <div className="h-20 flex items-center px-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white/90">PersonaChat</h1>
          </div>
        </div>

        <div className="px-4 space-y-1 mb-6">
          <button 
            onClick={() => setCurrentSessionId(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              currentSessionId === null ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home size={18} />
            Dashboard
          </button>
          
          <button 
            onClick={onNewChat}
            className="w-full mt-2 flex items-center justify-start gap-3 px-4 py-4 bg-[#28292a] hover:bg-[#333537] rounded-2xl text-sm font-medium text-white transition-all shadow-sm border border-white/5 active:scale-[0.98]"
          >
            <Plus size={20} className="text-purple-400" />
            New Simulation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-2 px-4 mb-3 opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Recent Activity</span>
          </div>
          
          <div className="space-y-1">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setCurrentSessionId(s.id)}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl truncate transition-all group ${
                  currentSessionId === s.id 
                    ? 'bg-purple-500/10 text-white border border-purple-500/20' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className={currentSessionId === s.id ? 'text-purple-400' : 'text-slate-600'} />
                  <span className="truncate">{s.title}</span>
                </div>
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="px-4 py-8 text-center opacity-20">
                <p className="text-xs">No active sessions</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-1 rounded-lg opacity-40 hover:opacity-100 transition-opacity cursor-default">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Core Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
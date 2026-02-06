import React from 'react';
import { Download, PanelLeftClose, PanelLeft, Share2 } from 'lucide-react';

interface HeaderProps {
  personaName?: string;
  onExport: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ personaName, onExport, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <header className="h-20 flex items-center justify-between px-6 bg-transparent z-40 border-b border-white/5">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
        
        <div className="flex flex-col ml-2">
          {personaName ? (
            <>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest opacity-80">Testing Session</span>
              <h1 className="text-lg font-semibold text-white/90">
                {personaName}
              </h1>
            </>
          ) : (
            <h1 className="text-lg font-semibold text-white/40">PersonaChat Dashboard</h1>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onExport}
          className="group flex items-center gap-2 px-5 py-2.5 bg-[#28292a] hover:bg-[#333537] rounded-full transition-all text-xs font-medium text-slate-200 border border-white/10"
        >
          <Download size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
          Export Insights
        </button>
        <button 
          className="p-2.5 rounded-full hover:bg-white/5 transition-all text-slate-400 hover:text-white"
        >
          <Share2 size={18} />
        </button>
      </div>
    </header>
  );
};
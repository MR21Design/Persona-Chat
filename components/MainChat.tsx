import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Persona, Emotion } from '../types';
import { Send, Zap, UserPlus, Sparkles, ChevronRight } from 'lucide-react';

interface MainChatProps {
  session: ChatSession | null;
  onUpdatePersona: (persona: Persona) => void;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const MainChat: React.FC<MainChatProps> = ({ session, onUpdatePersona, onSendMessage, isLoading }) => {
  const [formData, setFormData] = useState<Omit<Persona, 'isInitialized'>>({
    name: '',
    role: '',
    traits: '',
    scope: '',
  });
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [session?.messages, isLoading]);

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePersona({ ...formData, isInitialized: true });
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const getBubbleStyles = (emotion?: Emotion) => {
    switch (emotion) {
      case 'HAPPY':
      case 'EXCITED':
        return 'border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.15)] bg-[#22c55e]/5';
      case 'ANGRY':
      case 'FRUSTRATED':
        return 'border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-[#ef4444]/5';
      case 'IMPATIENT':
        return 'border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-[#f59e0b]/5';
      case 'CONFUSED':
        return 'border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.15)] bg-[#38bdf8]/5';
      default:
        return 'border-[#C084FC] shadow-[0_0_15px_rgba(192,132,252,0.1)] bg-transparent';
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative bg-gemini-main">
        <div className="relative z-10 space-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl backdrop-blur-xl animate-pulse">
            <Zap size={48} className="text-purple-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
              Design better with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI personas</span>
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto text-lg font-medium leading-relaxed opacity-70">
              Simulate high-fidelity user sessions with behavioral modeling.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session.persona.isInitialized) {
    return (
      <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto custom-scrollbar bg-gemini-main">
        <div className="max-w-2xl w-full py-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <UserPlus className="text-purple-400" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Configure Neural Persona</h2>
              <p className="text-sm text-slate-500 font-medium">Define the target behavior for this simulation</p>
            </div>
          </div>
          
          <form onSubmit={handleInitialize} className="space-y-6 glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Persona Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Maya"
                  className="w-full bg-[#1e1f20] border border-white/5 rounded-2xl px-5 py-4 focus:border-purple-500 outline-none transition-all text-[#e3e3e3] placeholder:text-slate-700 text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">User Role</label>
                <input 
                  type="text" required value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Senior Analyst"
                  className="w-full bg-[#1e1f20] border border-white/5 rounded-2xl px-5 py-4 focus:border-purple-500 outline-none transition-all text-[#e3e3e3] placeholder:text-slate-700 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Behavioral Traits</label>
              <textarea 
                required rows={3} value={formData.traits}
                onChange={e => setFormData(prev => ({ ...prev, traits: e.target.value }))}
                placeholder="Tech-savvy? Values speed over aesthetics? Critical of complexity?..."
                className="w-full bg-[#1e1f20] border border-white/5 rounded-2xl px-5 py-4 focus:border-purple-500 outline-none transition-all text-[#e3e3e3] placeholder:text-slate-700 text-sm font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Simulation Scope</label>
              <input 
                type="text" required value={formData.scope}
                onChange={e => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                placeholder="Feature or product being evaluated..."
                className="w-full bg-[#1e1f20] border border-white/5 rounded-2xl px-5 py-4 focus:border-purple-500 outline-none transition-all text-[#e3e3e3] placeholder:text-slate-700 text-sm font-medium"
              />
            </div>

            <button 
              type="submit"
              className="w-full group py-4 bg-white text-black font-bold rounded-2xl transition-all hover:bg-slate-200 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              Start Simulation
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 custom-scrollbar"
      >
        <div className="max-w-4xl mx-auto space-y-10">
          {session.messages.map((m) => {
            const isModel = m.role === 'model';
            
            return (
              <div key={m.id} className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-4 max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                  {isModel && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg border border-white/10">
                      <Sparkles size={20} className="text-white" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${!isModel ? 'items-end' : 'items-start'}`}>
                    <div className={`px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed font-medium border transition-all duration-500 ${
                      isModel 
                        ? getBubbleStyles(m.emotion)
                        : 'bg-[#28292a] text-white border-white/10'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                    <div className="text-[10px] mt-2 font-bold uppercase tracking-widest text-slate-600 px-2 flex items-center gap-2">
                      {isModel && m.emotion && (
                        <span className={`w-1.5 h-1.5 rounded-full ${m.emotion === 'HAPPY' ? 'bg-emerald-500' : m.emotion === 'FRUSTRATED' || m.emotion === 'ANGRY' ? 'bg-rose-500' : 'bg-purple-400'}`}></span>
                      )}
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-slate-800/30 border border-white/5 animate-pulse"></div>
               <div className="flex gap-2 p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-.4s]"></div>
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 md:p-12 bg-gradient-to-t from-[#131314] via-[#131314]/90 to-transparent">
        <form onSubmit={handleSubmitMessage} className="max-w-3xl mx-auto relative group">
          <input 
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Neural Input: Message ${session.persona.name}...`}
            className="w-full bg-[#1e1f20] border border-white/10 focus:border-purple-500/50 focus:bg-[#28292a] rounded-[2rem] px-8 py-5 pr-20 outline-none transition-all text-[#e3e3e3] placeholder:text-slate-600 font-medium shadow-2xl"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white disabled:opacity-20 text-black rounded-full transition-all shadow-xl hover:bg-slate-200 active:scale-90"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest opacity-40">AI-Simulated UX Research Environment</p>
        </div>
      </div>
    </div>
  );
};
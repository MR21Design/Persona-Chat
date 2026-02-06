import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainChat } from './components/MainChat';
import { VibePanel } from './components/VibePanel';
import { Header } from './components/Header';
import { ChatSession, Persona, Message, Emotion } from './types';
import { geminiService } from './services/gemini';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Session',
      persona: {
        name: '',
        role: '',
        traits: '',
        scope: '',
        isInitialized: false,
      },
      messages: [],
      currentEmotion: 'NEUTRAL',
      emotionHistory: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const updatePersona = (persona: Persona) => {
    if (!currentSessionId) return;
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, persona, title: persona.name || 'New Session' } 
        : s
    ));
  };

  const parseEmotion = (text: string): { cleanText: string; emotion: Emotion } => {
    const emotionRegex = /\[(CONFUSED|HAPPY|ANGRY|FRUSTRATED|EXCITED|BORED|IMPATIENT|NEUTRAL)\]/gi;
    let foundEmotion: Emotion = 'NEUTRAL';
    const matches = Array.from(text.matchAll(emotionRegex));
    if (matches.length > 0) {
      foundEmotion = matches[matches.length - 1][1].toUpperCase() as Emotion;
    }
    const cleanText = text.replace(emotionRegex, '').trim();
    return { cleanText, emotion: foundEmotion };
  };

  const sendMessage = async (content: string) => {
    if (!currentSessionId || !currentSession || !content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: [...s.messages, userMessage] } 
        : s
    ));

    setIsLoading(true);

    try {
      const responseText = await geminiService.generateResponse(
        currentSession.persona,
        [...currentSession.messages, userMessage],
        content
      );

      const { cleanText, emotion } = parseEmotion(responseText);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: cleanText,
        emotion,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { 
              ...s, 
              messages: [...s.messages, modelMessage],
              currentEmotion: emotion,
              emotionHistory: [...s.emotionHistory, { emotion, timestamp: Date.now() }]
            } 
          : s
      ));
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      let errorMsg = "⚠️ Connection interrupted. Please try again.";
      const errorStr = error?.message?.toLowerCase() || "";
      
      if (errorStr.includes("quota") || errorStr.includes("429")) {
        errorMsg = "⚠️ API Quota Exceeded. Please check your billing or wait a few minutes for the rate limit to reset.";
      }

      const systemErrorMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: errorMsg,
        emotion: 'FRUSTRATED',
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, systemErrorMessage] } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!currentSession) return;
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    const primaryBg = [19, 19, 20];
    const accentColor = [168, 85, 247];
    const textColor = [227, 227, 227];

    const applyPageTheme = () => {
      doc.setFillColor(...primaryBg); 
      doc.rect(0, 0, 210, 297, 'F');
    };

    applyPageTheme();
    
    doc.setFontSize(24);
    doc.setTextColor(...textColor);
    doc.text("PersonaChat: Research Insights", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 38);

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    let currentY = 55;

    // Helper for multiline text that tracks Y and handles page breaks
    const addWrappedText = (title: string, content: string, fontSize: number = 11, titleColor: number[] = [168, 85, 247], textColorArr: number[] = [200, 200, 200]) => {
      if (currentY > 270) {
        doc.addPage();
        applyPageTheme();
        currentY = 30;
      }
      
      doc.setFontSize(fontSize);
      doc.setTextColor(...titleColor);
      doc.text(title, 20, currentY);
      currentY += 7;

      doc.setTextColor(...textColorArr);
      const lines = doc.splitTextToSize(content, 170);
      lines.forEach((line: string) => {
        if (currentY > 280) {
          doc.addPage();
          applyPageTheme();
          currentY = 30;
        }
        doc.text(line, 20, currentY);
        currentY += 6;
      });
      currentY += 4;
    };

    // Persona Profile Section
    doc.setFontSize(16);
    doc.setTextColor(...accentColor);
    doc.text("Persona Profile", 20, currentY);
    currentY += 10;

    addWrappedText("Name", currentSession.persona.name);
    addWrappedText("Role", currentSession.persona.role);
    addWrappedText("Behavioral Traits", currentSession.persona.traits);
    addWrappedText("Simulation Scope", currentSession.persona.scope);

    // Emotional Journey Chart Section
    if (currentY > 220) {
      doc.addPage();
      applyPageTheme();
      currentY = 30;
    }

    doc.setFontSize(16);
    doc.setTextColor(...accentColor);
    doc.text("Emotional Journey Chart", 20, currentY);
    
    const chartBaseX = 30;
    const chartBaseY = currentY + 50;
    const chartWidth = 150;
    const chartHeight = 40;

    doc.setDrawColor(80, 80, 80);
    doc.line(chartBaseX, chartBaseY, chartBaseX + chartWidth, chartBaseY);
    doc.line(chartBaseX, chartBaseY, chartBaseX, chartBaseY - chartHeight);

    const emotionValues: Record<string, number> = {
      'HAPPY': 1.0, 'EXCITED': 1.0,
      'NEUTRAL': 0.5,
      'BORED': 0.4, 'CONFUSED': 0.3,
      'IMPATIENT': 0.2, 'FRUSTRATED': 0.1, 'ANGRY': 0.0
    };

    if (currentSession.emotionHistory.length > 1) {
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(1);
      const step = chartWidth / (currentSession.emotionHistory.length - 1);
      
      currentSession.emotionHistory.forEach((h, i) => {
        if (i < currentSession.emotionHistory.length - 1) {
          const x1 = chartBaseX + (i * step);
          const y1 = chartBaseY - (emotionValues[h.emotion] * chartHeight);
          const nextH = currentSession.emotionHistory[i+1];
          const x2 = chartBaseX + ((i + 1) * step);
          const y2 = chartBaseY - (emotionValues[nextH.emotion] * chartHeight);
          doc.line(x1, y1, x2, y2);
          
          doc.setFillColor(...accentColor);
          doc.circle(x1, y1, 1, 'F');
          if (i === currentSession.emotionHistory.length - 2) {
             doc.circle(x2, y2, 1, 'F');
          }
        }
      });
    } else {
       doc.setFontSize(10);
       doc.setTextColor(100, 100, 100);
       doc.text("Insufficient data for mapping journey.", chartBaseX + 10, chartBaseY - 20);
    }

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Happy", chartBaseX - 12, chartBaseY - chartHeight);
    doc.text("Neutral", chartBaseX - 12, chartBaseY - (chartHeight / 2));
    doc.text("Frustrated", chartBaseX - 12, chartBaseY);

    currentY = chartBaseY + 25;
    
    // Simulation Transcript Section
    if (currentY > 260) {
      doc.addPage();
      applyPageTheme();
      currentY = 30;
    }

    doc.setFontSize(16);
    doc.setTextColor(...accentColor);
    doc.text("Simulation Transcript", 20, currentY);
    currentY += 10;

    currentSession.messages.forEach((msg) => {
      if (currentY > 270) {
        doc.addPage();
        applyPageTheme();
        currentY = 30;
      }
      
      const role = msg.role === 'user' ? 'RESEARCHER' : currentSession.persona.name.toUpperCase();
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      // Removed timestamp from here
      doc.text(`${role}${msg.emotion ? ` (${msg.emotion})` : ''}:`, 20, currentY);
      currentY += 6;

      doc.setFontSize(10);
      doc.setTextColor(220, 220, 220);
      const splitText = doc.splitTextToSize(msg.content, 170);
      splitText.forEach((line: string) => {
        if (currentY > 285) {
          doc.addPage();
          applyPageTheme();
          currentY = 30;
        }
        doc.text(line, 25, currentY);
        currentY += 5;
      });
      currentY += 3;
    });

    doc.save(`PersonaChat-Report-${currentSession.persona.name.replace(/\s+/g, '-') || 'Session'}.pdf`);
  };

  return (
    <div className="flex h-screen w-full bg-gemini-main text-[#e3e3e3] overflow-hidden relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        onNewChat={createNewChat}
      />
      
      <div className="flex flex-col flex-1 relative min-w-0">
        <Header 
          personaName={currentSession?.persona.name} 
          onExport={exportReport}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        
        <main className="flex flex-1 overflow-hidden relative">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full -z-10"></div>
          
          <div className="flex-1 flex flex-col min-w-0">
            <MainChat 
              session={currentSession}
              onUpdatePersona={updatePersona}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>

          <VibePanel 
            currentEmotion={currentSession?.currentEmotion || 'NEUTRAL'}
            history={currentSession?.emotionHistory || []}
            isVisible={!!currentSession && currentSession.persona.isInitialized}
          />
        </main>
      </div>
    </div>
  );
};

export default App;

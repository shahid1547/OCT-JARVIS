import React, { useState, useRef, useEffect } from 'react';
import { User, Message, TutorMode, GraphData } from '../types';
import { geminiService } from '../services/geminiService';
import { ICONS } from '../constants';
import MemoryGraph from './MemoryGraph';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, theme, toggleTheme }) => {
  const [mode, setMode] = useState<TutorMode>(TutorMode.EXPLAIN);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      content: `Hello ${user.name}! I'm Jarvis. I see you're studying ${user.stream} in ${user.standard}. How can I help you today?`,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // New Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // D3 Graph Data State
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio Playback for Live API
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const liveSessionRef = useRef<{ disconnect: () => void } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, searchQuery]); // Also scroll when filtering

  // Update Graph based on chat content
  const updateMemoryGraph = (text: string) => {
    const keywords = text.split(' ').filter(w => w.length > 5 && /^[A-Z]/.test(w)).slice(0, 3);
    if (keywords.length === 0) return;

    setGraphData(prev => {
      const newNodes = [...prev.nodes];
      const newLinks = [...prev.links];
      
      keywords.forEach(k => {
        const id = k.replace(/[^a-zA-Z]/g, '');
        if (!newNodes.find(n => n.id === id)) {
          newNodes.push({ id, group: 1 });
          if (newNodes.length > 1) {
             const target = newNodes[Math.floor(Math.random() * (newNodes.length - 1))];
             if(target.id !== id) newLinks.push({ source: id, target: target.id, value: 1 });
          }
        }
      });
      return { nodes: newNodes, links: newLinks };
    });
  };

  // Text to Speech
  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    // Strip markdown chars for better reading
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  }

  const handleClearHistory = () => {
    if(window.confirm("Are you sure you want to clear the chat history?")) {
        setMessages([{
            id: Date.now().toString(),
            role: 'model',
            content: `History cleared. What would you like to learn next, ${user.name}?`,
            timestamp: Date.now()
        }]);
        setGraphData({ nodes: [], links: [] });
        stopSpeaking();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    stopSpeaking(); // Stop any previous speech

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (user.isPro && (inputValue.toLowerCase().includes('picture') || inputValue.toLowerCase().includes('diagram'))) {
        const { imageUrl, text } = await geminiService.generateDiagram(inputValue);
        if (imageUrl) {
            const botMsg: Message = {
                id: Date.now().toString(),
                role: 'model',
                content: text || "Here is a visual aid.",
                image: imageUrl,
                timestamp: Date.now()
            };
             setMessages(prev => [...prev, botMsg]);
            updateMemoryGraph(text || inputValue);
            if(isTTSEnabled) speakText(botMsg.content);
            setIsLoading(false);
            return;
        }
      }

      const responseText = await geminiService.sendMessage(
        messages.map(m => ({ role: m.role, content: m.content })),
        userMsg.content,
        user,
        mode
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
      updateMemoryGraph(responseText);
      
      if(isTTSEnabled) {
        speakText(responseText);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceActive) {
      liveSessionRef.current?.disconnect();
      setIsVoiceActive(false);
      audioContextRef.current?.close();
      audioContextRef.current = null;
    } else {
      stopSpeaking(); // Stop TTS if switching to Live
      setIsVoiceActive(true);
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = audioContextRef.current.currentTime;
      
      const session = await geminiService.connectLive(
        user,
        (audioBuffer) => {
          if (!audioContextRef.current) return;
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          
          const currentTime = audioContextRef.current.currentTime;
          const startTime = Math.max(nextStartTimeRef.current, currentTime);
          source.start(startTime);
          nextStartTimeRef.current = startTime + audioBuffer.duration;
        },
        () => setIsVoiceActive(false)
      );

      if (session) {
        liveSessionRef.current = session;
      } else {
        setIsVoiceActive(false);
        alert("Could not access microphone or connect to Live API.");
      }
    }
  };

  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
              <div className="text-blue-700 dark:text-blue-400">
                <ICONS.JarvisLogo />
              </div>
              <span className="text-xl font-bold tracking-wider">JARVIS</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">{user.stream} • {user.standard}</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Teaching Mode</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setMode(TutorMode.EXPLAIN)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all font-medium flex items-center gap-3 ${mode === TutorMode.EXPLAIN ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <div className={`w-2 h-2 rounded-full ${mode === TutorMode.EXPLAIN ? 'bg-blue-600' : 'bg-slate-400'}`} />
                Explain Mode
              </button>
              <button 
                onClick={() => setMode(TutorMode.PRACTICE)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all font-medium flex items-center gap-3 ${mode === TutorMode.PRACTICE ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <div className={`w-2 h-2 rounded-full ${mode === TutorMode.PRACTICE ? 'bg-blue-600' : 'bg-slate-400'}`} />
                Practice Mode
              </button>
            </div>
          </div>

          <div>
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Advanced (Pro)</h3>
             <button 
                disabled={!user.isPro}
                onClick={() => setMode(TutorMode.EXAM_PREP)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center font-medium ${mode === TutorMode.EXAM_PREP ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'} ${!user.isPro && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${mode === TutorMode.EXAM_PREP ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                    <span>Exam Paper Predictor</span>
                </div>
                {!user.isPro && <ICONS.Sparkles />}
              </button>
          </div>
          
           <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Actions</h3>
            <button 
                onClick={handleClearHistory}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all font-medium flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <ICONS.Trash width={18} height={18} />
                Clear Chat History
            </button>
          </div>

          <div className="mt-auto">
             <MemoryGraph data={graphData} theme={theme} />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ICONS.LogOut /> Log out
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative transition-colors duration-300 bg-gray-50 dark:bg-gradient-to-b dark:from-[#0f172a] dark:to-[#172554]">
        
        {/* Unified Header for Desktop and Mobile */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md justify-between sticky top-0 z-10 shadow-sm">
           <div className="flex items-center gap-2 md:hidden text-blue-700 dark:text-blue-400">
               <ICONS.JarvisLogo width={28} height={28} />
               <span className="font-bold text-lg">JARVIS</span>
           </div>
           
           {/* Desktop Title / Empty space */}
           <div className="hidden md:block">
              {isSearchOpen ? (
                   <input 
                      type="text" 
                      autoFocus
                      placeholder="Search messages..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm text-slate-800 dark:text-white w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                   />
              ) : (
                  <h2 className="font-semibold text-slate-700 dark:text-slate-200">{mode === TutorMode.EXPLAIN ? 'Explain Mode' : mode === TutorMode.PRACTICE ? 'Practice Mode' : 'Exam Prep'}</h2>
              )}
           </div>

           <div className="flex items-center gap-3">
             <button 
                onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(''); }}
                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-slate-500 hover:text-blue-600 dark:text-slate-400'}`}
                title="Search Chat"
             >
                <ICONS.Search width={20} height={20} />
             </button>
             
             <button 
                onClick={() => { setIsTTSEnabled(!isTTSEnabled); if(isTTSEnabled) stopSpeaking(); }}
                className={`p-2 rounded-full transition-colors ${isTTSEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'text-slate-500 hover:text-green-600 dark:text-slate-400'}`}
                title="Text to Speech Auto-read"
             >
                {isTTSEnabled ? <ICONS.Volume2 width={20} height={20} /> : <ICONS.VolumeX width={20} height={20} />}
             </button>

             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-yellow-400 transition-colors"
             >
               {theme === 'dark' ? <ICONS.Sun width={20} height={20} /> : <ICONS.Moon width={20} height={20} />}
             </button>
             
             <button onClick={onLogout} className="md:hidden text-slate-500"><ICONS.LogOut width={20} height={20} /></button>
           </div>
        </header>

        {/* Live Voice Overlay */}
        {isVoiceActive && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse-slow mb-8 border border-blue-500/20">
               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
                  <div className="text-white transform scale-150"><ICONS.Mic /></div>
               </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Listening...</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Speak naturally to Jarvis.</p>
            <button 
              onClick={toggleVoiceMode}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 transition-all hover:scale-110 shadow-lg"
            >
              <ICONS.Stop />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredMessages.length === 0 && searchQuery && (
              <div className="text-center text-slate-500 mt-10">No messages found matching "{searchQuery}"</div>
          )}
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar (Bot) */}
              {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0 shadow-sm border border-slate-300 dark:border-slate-600 group cursor-pointer" onClick={() => speakText(msg.content)} title="Read Aloud">
                      <div className="transform scale-75 group-hover:scale-90 transition-transform"><ICONS.JarvisLogo /></div>
                  </div>
              )}

              <div className={`max-w-[85%] md:max-w-[70%] p-4 sm:p-5 shadow-sm relative group ${
                msg.role === 'user' 
                  ? 'bg-blue-700 text-white rounded-2xl rounded-tr-none shadow-md shadow-blue-900/10' 
                  : 'bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700'
              }`}>
                {msg.image && (
                    <img src={msg.image} alt="Generated Visual" className="rounded-xl mb-4 w-full object-cover border border-white/20 shadow-sm" />
                )}
                {/* Manual Speak button for each message */}
                {msg.role === 'model' && (
                    <button 
                        onClick={() => speakText(msg.content)}
                        className="absolute -top-3 -right-3 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-blue-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Read this message"
                    >
                        <ICONS.Volume2 width={14} height={14} />
                    </button>
                )}

                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                    {msg.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0 leading-relaxed" dangerouslySetInnerHTML={{ 
                            // Basic bold rendering for markdown, keeping it simple without a heavy MD library
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} />
                    ))}
                </div>
                <div className={`text-[10px] mt-2 opacity-60 text-right ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Avatar (User) */}
              {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                      <ICONS.UserAvatar />
                  </div>
              )}

            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-end gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0 shadow-sm border border-slate-300 dark:border-slate-600">
                  <div className="transform scale-75"><ICONS.JarvisLogo /></div>
               </div>
               <div className="bg-white dark:bg-[#1e293b]/90 rounded-2xl rounded-tl-none p-4 border border-slate-200 dark:border-slate-700 flex gap-2 items-center shadow-sm">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s'}}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s'}}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
             <button 
               onClick={toggleVoiceMode}
               className={`p-4 rounded-full transition-all flex-shrink-0 shadow-sm ${
                   isVoiceActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:shadow-md'
               }`}
               title="Start Live Voice Session"
             >
                <ICONS.Mic />
             </button>
             <div className="flex-1 relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={mode === TutorMode.PRACTICE ? "Type your answer..." : "Ask Jarvis anything..."}
                  className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-full py-4 px-6 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
             </div>
             <button 
               onClick={handleSendMessage}
               disabled={isLoading || !inputValue.trim()}
               className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-full transition-all flex-shrink-0 shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 active:scale-95"
             >
                <ICONS.Send />
             </button>
          </div>
          <div className="text-center mt-3 text-xs font-medium text-slate-400 flex justify-center items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${mode === TutorMode.EXPLAIN ? 'bg-blue-500' : 'bg-indigo-500'}`}></span>
            {mode === TutorMode.EXPLAIN && "Explain Mode • Step-by-step learning"}
            {mode === TutorMode.PRACTICE && "Practice Mode • Interactive assessment"}
            {mode === TutorMode.EXAM_PREP && "Exam Prep • AI Paper Prediction"}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useRef, useEffect } from 'react';
import { GeminiChatMessage, Transaction, BillAnalysis } from '../types';
import { getFinancialAdvice, analyzeBillImage, generateCreativeBill } from '../services/geminiService';
import { Send, Camera, ImagePlus, Loader2, FileText, Sparkles, MessageSquare, Download, Trash2, ArrowUp, Maximize2, Minimize2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface AiHubProps {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

const STRATEGISTS = [
  { id: 'Chanakya', name: 'Chanakya', color: 'from-amber-600 to-orange-700', icon: '📜', greeting: "Swagat hai, Vats! Arthneeti pe charcha karein?", suggestions: ["How to save more?", "Is buying an iPhone wise?", "Reduce my debt."] },
  { id: 'Krishna', name: 'Krishna', color: 'from-blue-600 to-cyan-600', icon: '🪈', greeting: "Parth, karm karo, phal ki chinta mat karo.", suggestions: ["How to invest without fear?", "Duty towards family finances.", "Should I take risk?"] },
  { id: 'Vivekananda', name: 'Vivekananda', color: 'from-orange-500 to-red-600', icon: '🧘', greeting: "Arise, awake! Make money a force for good.", suggestions: ["Money and character.", "Youth financial advice.", "Investing for strength."] },
  { id: 'Gandhi', name: 'Gandhi', color: 'from-emerald-600 to-green-700', icon: '👓', greeting: "There is enough for need, not for greed.", suggestions: ["Live simply.", "Avoid debt.", "Ethical earning."] },
  { id: 'Einstein', name: 'Einstein', color: 'from-purple-600 to-indigo-700', icon: '⚛️', greeting: "Compound interest is the 8th wonder.", suggestions: ["Explain Rule of 72.", "Math behind SIP.", "Inflation relativity."] },
  { id: 'Shri Ram', name: 'Shri Ram', color: 'from-yellow-500 to-amber-500', icon: '🏹', greeting: "Walk the path of Dharma in wealth too.", suggestions: ["Family financial security.", "Righteous spending.", "Planning for future."] },
];

const AiHub: React.FC<AiHubProps> = ({ onAddTransaction }) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'bill' | 'fun'>('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chat State
  const [activePersona, setActivePersona] = useState(STRATEGISTS[0]);
  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    { role: 'model', text: STRATEGISTS[0].greeting }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bill State
  const [analyzing, setAnalyzing] = useState(false);
  const [billResult, setBillResult] = useState<BillAnalysis | null>(null);

  // Fun State
  const [funInput, setFunInput] = useState('');
  const [funResult, setFunResult] = useState('');

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Simple Markdown Parser for Bold and Newlines
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="min-h-[1em] mb-1">
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-gold-400">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setInput('');
    if(textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
    setIsLoading(true);

    const response = await getFinancialAdvice(
        userMsg, 
        newMessages.map(m => ({ role: m.role, text: m.text })),
        activePersona.id
    );
    
    setMessages([...newMessages, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const handlePersonaChange = (persona: typeof STRATEGISTS[0]) => {
    setActivePersona(persona);
    setMessages([{ role: 'model', text: persona.greeting }]);
  };

  const handleClearChat = () => {
    setMessages([{ role: 'model', text: activePersona.greeting }]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if(textareaRef.current) textareaRef.current.focus();
  };

  // --- Bill Functions ---
  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setBillResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeBillImage(base64String, file.type);
      setBillResult(result);
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmBill = () => {
    if (billResult) {
      onAddTransaction({
        amount: billResult.total,
        description: `Bill: ${billResult.merchant}`,
        type: 'EXPENSE' as any,
        category: billResult.category,
        date: new Date().toISOString()
      });
      setBillResult(null);
      alert("Transaction added to Ledger!");
    }
  };

  const handleFunBill = async () => {
    if (!funInput) return;
    setAnalyzing(true);
    const result = await generateCreativeBill(funInput);
    setFunResult(result);
    setAnalyzing(false);
  };

  const downloadInvoicePDF = () => {
      if (!funResult) return;
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(200, 150, 50);
      doc.text("Official Invoice - Maa Ka Pyaar", 20, 20);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("------------------------------------------------", 20, 30);
      const splitText = doc.splitTextToSize(funResult, 180);
      doc.text(splitText, 20, 40);
      doc.save("Artha_Fun_Invoice.pdf");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`
      flex flex-col md:flex-row gap-6 transition-all duration-300 animate-fade-in
      ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-4 md:p-8' : 'h-[calc(100vh-8rem)]'}
    `}>
      
      {/* Sidebar Mode Switcher */}
      <div className={`
        flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0
        ${isFullscreen ? 'md:w-72' : 'md:w-64'}
      `}>
        <button 
          onClick={() => setActiveMode('chat')}
          className={`p-4 rounded-xl flex items-center gap-3 transition-all ${activeMode === 'chat' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50 shadow-lg shadow-gold-500/10' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <MessageSquare size={20} />
          <span className="font-medium whitespace-nowrap">Mentor Chat</span>
        </button>
        <button 
          onClick={() => setActiveMode('bill')}
          className={`p-4 rounded-xl flex items-center gap-3 transition-all ${activeMode === 'bill' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <Camera size={20} />
          <span className="font-medium whitespace-nowrap">Scan Bill</span>
        </button>
        <button 
          onClick={() => setActiveMode('fun')}
          className={`p-4 rounded-xl flex items-center gap-3 transition-all ${activeMode === 'fun' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <Sparkles size={20} />
          <span className="font-medium whitespace-nowrap">Fun Invoice</span>
        </button>
        
        {/* Fullscreen Toggle on Sidebar (Desktop only) */}
        <button 
          onClick={toggleFullscreen}
          className="hidden md:flex mt-auto p-4 rounded-xl items-center gap-3 bg-white/5 text-slate-400 hover:bg-white/10 transition-all border border-white/5"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          <span className="font-medium">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`
        flex-1 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative
        ${isFullscreen ? 'max-w-6xl mx-auto' : ''}
      `}>
        
        {/* Fullscreen Toggle Button (Mobile & Top Bar) */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-14 z-20 p-2 text-slate-500 hover:text-white bg-slate-800/80 rounded-lg md:hidden"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* CHAT MODE */}
        {activeMode === 'chat' && (
          <div className="flex flex-col h-full relative">
            
            {/* Persona Selector & Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between z-10">
                <div className="flex gap-3 overflow-x-auto no-scrollbar mask-image-gradient pr-10">
                    {STRATEGISTS.map(s => (
                        <button 
                           key={s.id} 
                           onClick={() => handlePersonaChange(s)}
                           className={`
                             group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border
                             ${activePersona.id === s.id 
                                ? `bg-gradient-to-r ${s.color} border-white/20 text-white shadow-lg` 
                                : 'bg-slate-800 border-white/10 text-slate-400 hover:bg-slate-700'}
                           `}
                        >
                           <span className="text-lg">{s.icon}</span>
                           <span className="text-xs font-bold uppercase tracking-wide">{s.name}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                      onClick={handleClearChat}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                      title="Clear Chat"
                  >
                      <Trash2 size={18} />
                  </button>
                  <button 
                      onClick={toggleFullscreen}
                      className="hidden md:flex p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" 
                      title={isFullscreen ? "Minimize" : "Maximize"}
                  >
                      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className={`
              flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth
              ${isFullscreen ? 'px-8 md:px-16' : ''}
            `} ref={scrollRef}>
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                    <div key={idx} className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
                        {/* Avatar */}
                        {!isUser && (
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activePersona.color} flex items-center justify-center text-sm shadow-lg shrink-0`}>
                                {activePersona.icon}
                            </div>
                        )}
                        
                        {/* Bubble */}
                        <div className={`
                            max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                            ${isUser 
                                ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-br-none border border-white/10' 
                                : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-white/5'}
                        `}>
                            {renderMessageText(m.text)}
                        </div>
                    </div>
                );
              })}
              
              {isLoading && (
                <div className="flex items-end gap-3">
                   <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activePersona.color} flex items-center justify-center text-sm shadow-lg animate-pulse`}>
                        {activePersona.icon}
                   </div>
                   <div className="bg-slate-800/80 p-4 rounded-2xl rounded-bl-none border border-white/5 flex gap-2 items-center text-slate-400">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className={`
              p-4 bg-slate-900/90 border-t border-white/10 backdrop-blur-md
              ${isFullscreen ? 'px-8 md:px-16 pb-8' : ''}
            `}>
              {/* Suggestion Chips */}
              {messages.length < 3 && !isLoading && (
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                      {activePersona.suggestions.map((s, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSuggestionClick(s)}
                            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-gold-500/50 hover:bg-slate-700 transition-all"
                          >
                             {s}
                          </button>
                      ))}
                  </div>
              )}

              <div className="flex items-end gap-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-2 focus-within:border-gold-500/50 focus-within:bg-slate-800 transition-all shadow-inner">
                <textarea 
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
                  placeholder={`Ask ${activePersona.name}... (Shift+Enter for new line)`}
                  rows={1}
                  className="flex-1 bg-transparent border-none text-white px-3 py-3 focus:ring-0 resize-none max-h-32 min-h-[44px] placeholder-slate-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-3 rounded-xl mb-0.5 transition-all ${input.trim() ? 'bg-gold-500 text-slate-900 hover:bg-gold-400 shadow-lg shadow-gold-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BILL SCAN MODE */}
        {activeMode === 'bill' && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
             {!billResult ? (
               <div className="max-w-md w-full space-y-6">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-600">
                   {analyzing ? <Loader2 className="animate-spin text-emerald-400" size={32} /> : <FileText className="text-slate-500" size={32} />}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2">Upload Bill Image</h3>
                   <p className="text-slate-400 text-sm">Gemini will extract details and auto-fill your ledger.</p>
                 </div>
                 <label className="block w-full cursor-pointer group">
                   <input type="file" accept="image/*" onChange={handleBillUpload} className="hidden" />
                   <div className="bg-gradient-to-r from-emerald-600 to-teal-700 group-hover:from-emerald-500 group-hover:to-teal-600 text-white py-4 px-6 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2 transform group-hover:scale-[1.02]">
                     <ImagePlus size={20} />
                     Select Image
                   </div>
                 </label>
               </div>
             ) : (
                <div className="w-full max-w-lg bg-slate-800/80 border border-white/10 rounded-2xl p-6 text-left shadow-2xl">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
                    <Sparkles size={18} /> Analysis Complete
                  </h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm uppercase">Merchant</span>
                      <span className="font-bold text-white text-lg">{billResult.merchant}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm uppercase">Date</span>
                      <span className="font-mono text-slate-200">{billResult.date}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                      <span className="text-slate-400 text-sm uppercase">Total</span>
                      <span className="font-bold text-2xl text-emerald-400">₹{billResult.total}</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">Line Items</p>
                      <ul className="text-sm space-y-2 text-slate-300 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {billResult.items?.map((item, i) => (
                          <li key={i} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                            <span>{item.name}</span>
                            <span className="font-mono">₹{item.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setBillResult(null)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium">Discard</button>
                    <button onClick={handleConfirmBill} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20">Add to Ledger</button>
                  </div>
                </div>
             )}
           </div>
        )}

        {/* FUN BILL MODE */}
        {activeMode === 'fun' && (
          <div className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
             <div className="w-full max-w-2xl text-center mb-8">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">The "Mom Style" Invoice</h3>
                <p className="text-slate-400 text-sm">Generate a cute bill for homemade food to show your appreciation (or demand payment in hugs).</p>
             </div>
             
             <div className="w-full max-w-md flex gap-2 mb-8 bg-slate-800/50 p-2 rounded-2xl border border-white/10">
               <input 
                 value={funInput}
                 onChange={e => setFunInput(e.target.value)}
                 placeholder="e.g. Rajma Chawal, 2 Roti, Lassi"
                 className="flex-1 bg-transparent border-none px-4 py-2 text-white focus:ring-0 placeholder-slate-500"
                 onKeyDown={(e) => e.key === 'Enter' && handleFunBill()}
               />
               <button 
                 onClick={handleFunBill} 
                 disabled={analyzing}
                 className="bg-purple-600 hover:bg-purple-700 p-3 rounded-xl text-white shadow-lg"
               >
                 {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
               </button>
             </div>

             {funResult && (
               <div className="flex flex-col gap-6 w-full max-w-md animate-fade-in pb-10">
                   <div className="bg-[#fffbf0] text-slate-900 p-8 rounded-lg shadow-2xl font-mono text-sm leading-relaxed relative transform rotate-1 border-t-8 border-purple-500 relative">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                        Official Invoice
                      </div>
                      <div className="absolute top-4 right-4 text-purple-200 opacity-20 transform rotate-12">
                          <Sparkles size={64} />
                      </div>
                      <pre className="whitespace-pre-wrap font-inherit relative z-10">{funResult}</pre>
                      <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 text-center text-xs text-slate-500">
                        Generated by Artha AI • No Refunds on Love • {new Date().toLocaleDateString()}
                      </div>
                   </div>
                   
                   <button 
                     onClick={downloadInvoicePDF}
                     className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 border border-white/10 transition-colors shadow-lg hover:shadow-slate-900/50 font-medium"
                   >
                       <Download size={20} /> Download PDF
                   </button>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AiHub;


import React, { useState } from 'react';
import { Rocket, Package, Globe, ShieldCheck, CheckCircle2, ChevronRight, X, ExternalLink, Github, Cpu, Cloud, Smartphone, Copy, FileCode, FolderArchive, ListChecks, AlertCircle } from 'lucide-react';

interface PublishingGuideProps {
  onClose: () => void;
}

const PublishingGuide: React.FC<PublishingGuideProps> = ({ onClose }) => {
  const [activePhase, setActivePhase] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Command copied to clipboard!");
  };

  const phases = [
    {
      title: "1. Structure Check",
      icon: <ListChecks className="text-blue-400" />,
      steps: [
        "I see your 'Artha' folder is ready! Double-check these files:",
        "✅ index.html (Must have the <script src='/index.tsx'> tag)",
        "✅ App.tsx & index.tsx",
        "✅ package.json (Must have 'build' script)",
        "✅ components/ & services/"
      ]
    },
    {
      title: "2. GitHub Sync",
      icon: <Github className="text-white" />,
      steps: [
        "Use the 'Save to GitHub' button in AI Studio.",
        "Or use GitHub Desktop to 'Push' your local changes.",
        "Every time you Push, Vercel updates your app automatically."
      ]
    },
    {
      title: "3. Vercel (The Fix)",
      icon: <Cloud className="text-blue-400" />,
      steps: [
        "If you see a blank page, it means the script link was missing.",
        "Check your 'index.html' for <script type='module' src='/index.tsx'></script>",
        "Ensure your API_KEY is set in Vercel settings.",
        "Redeploy if needed."
      ]
    },
    {
      title: "4. Create Android App",
      icon: <Smartphone className="text-emerald-400" />,
      steps: [
        "Open your PC Terminal (Command Prompt).",
        "Use 'bubblewrap build' to generate your '.aab' file.",
        "Upload that file to Google Play Console.",
        "Done!"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold-500/20 rounded-2xl">
              <Rocket className="text-gold-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Launchpad</h2>
              <p className="text-sm text-slate-400">Troubleshooting & Launch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-64 bg-black/20 p-4 border-r border-white/5 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
            {phases.map((phase, i) => (
              <button
                key={i}
                onClick={() => setActivePhase(i)}
                className={`flex-1 md:flex-none p-4 rounded-2xl flex items-center gap-3 transition-all text-left border ${
                  activePhase === i 
                    ? 'bg-gold-500/10 border-gold-500/50 text-gold-400' 
                    : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {phase.icon}
                <span className="font-bold text-sm whitespace-nowrap">{phase.title}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 p-8 overflow-y-auto bg-slate-900/50">
            <div className="max-w-xl animate-fade-in" key={activePhase}>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                {phases[activePhase].icon}
                {phases[activePhase].title}
              </h3>

              <div className="space-y-4">
                {phases[activePhase].steps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1.5 w-5 h-5 rounded-full border border-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:border-gold-500 group-hover:text-gold-500 transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>

              {activePhase === 2 && (
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
                   <AlertCircle className="text-amber-400 shrink-0" size={24} />
                   <p className="text-xs text-slate-400 leading-relaxed">
                     <strong>Seeing a blank page?</strong> This is the #1 issue. It usually means Vercel didn't know which file was the main one. Ensure you've copied the updated 'index.html' from this chat!
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <ShieldCheck size={14} className="text-emerald-500" /> Vercel Build Compatibility Checked
          </div>
          <button 
            onClick={() => activePhase < phases.length - 1 ? setActivePhase(activePhase + 1) : onClose()}
            className="px-8 py-2 bg-gold-500 text-slate-900 rounded-xl font-bold hover:bg-gold-400 shadow-lg shadow-gold-500/20 transition-all flex items-center gap-2"
          >
            {activePhase === phases.length - 1 ? "Fix & Launch!" : "Next Step"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishingGuide;

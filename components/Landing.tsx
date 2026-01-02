
import React from 'react';
import { ArrowRight, ShieldCheck, Globe, Zap, Landmark } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
      {/* Institutional Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,78,59,0.15),rgba(2,6,23,1))] z-0"></div>
      <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-gold-600/5 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px]"></div>

      {/* Decorative Grid Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff11 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center">
        
        {/* Institutional Badge */}
        <div className="mb-8 inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in shadow-xl">
           <Landmark size={16} className="text-gold-400" />
           <span className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-300">Institutional Private Wealth</span>
        </div>

        {/* The "Artha" Signature Logo - High Premium */}
        <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter mb-6 animate-fade-in drop-shadow-[0_0_35px_rgba(250,204,21,0.2)]">
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-white to-emerald-400">ARTHA</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-3xl font-light tracking-wide max-w-3xl mb-16 animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
          Strategic wealth orchestration through the ancient foresight of <span className="text-gold-400 font-medium">Chanakya</span> and <span className="text-white font-medium">Cognitive Strategic Engines</span>.
        </p>

        {/* Feature Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
           <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.04] transition-all hover:shadow-2xl">
              <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center mb-8 border border-gold-500/20 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="text-gold-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Vats Protection</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Enterprise-grade biometric security layers designed for high-net-worth digital identities.</p>
           </div>
           
           <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.04] transition-all hover:shadow-2xl">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                 <Globe className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Global Corridors</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Real-time signal processing from international bourses to provide a 360° wealth horizon.</p>
           </div>

           <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.04] transition-all hover:shadow-2xl">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                 <Zap className="text-blue-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Niti Intelligence</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Automated reasoning engines that simulate thousands of financial paths for your unique mission.</p>
           </div>
        </div>

        {/* Main CTA */}
        <button 
           onClick={onEnter}
           className="group relative inline-flex items-center gap-6 bg-white text-slate-950 font-black px-16 py-8 rounded-full text-xl uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-gold-500/30 animate-fade-in"
           style={{ animationDelay: '600ms' }}
        >
           Enter the Arthaverse <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform duration-500" />
        </button>

        {/* Footer Meta */}
        <div className="mt-24 text-slate-700 text-[10px] uppercase tracking-[0.6em] font-black">
           Artha Private Wealth Management • Security Verified
        </div>
      </div>
    </div>
  );
};

export default Landing;


import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, UserProfile } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Globe, ShieldCheck, Zap, ArrowUpRight, BookOpen, Quote, Flame, Scale } from 'lucide-react';
import { getMarketNews, getGoldPrice } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, user }) => {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [goldPrice, setGoldPrice] = useState<string>("72,500");
  const [niti] = useState<string>("Wealth is the foundation of Dharma, and the root of wealth is disciplined strategy. A person who is not disciplined in their spending can never rule their own destiny.");

  const historyTransactions = transactions.filter(t => new Date(t.date).getTime() <= new Date().getTime());
  
  const totalIncome = historyTransactions.filter(t => t.type === TransactionType.INCOME).reduce((a, c) => a + c.amount, 0);
  const totalExpense = historyTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, c) => a + c.amount, 0);
  const currentNetWorth = (user.currentSavings || 0) + totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const healthScore = Math.min(100, Math.max(0, 50 + (savingsRate / 2)));

  useEffect(() => {
    getMarketNews().then(setHeadlines);
    getGoldPrice().then(setGoldPrice);
  }, []);

  const formatHeadline = (text: string) => {
    const clean = text.replace(/[*•]/g, '').trim();
    const keywords = [
      { word: 'Bullish', color: 'text-emerald-400' },
      { word: 'Bearish', color: 'text-rose-400' },
      { word: 'High', color: 'text-emerald-400' },
      { word: 'Sensex', color: 'text-gold-400 font-black' },
      { word: 'Nifty', color: 'text-gold-400 font-black' },
      { word: 'IPO', color: 'text-blue-400' },
      { word: 'Gold', color: 'text-gold-500 font-bold' },
      { word: 'Rises', color: 'text-emerald-400' },
      { word: 'Falls', color: 'text-rose-400' },
    ];

    let elements: React.ReactNode[] = [clean];
    keywords.forEach(({ word, color }) => {
      elements = elements.flatMap(el => {
        if (typeof el !== 'string') return el;
        const parts = el.split(new RegExp(`(${word})`, 'gi'));
        return parts.map((part, i) => 
          part.toLowerCase() === word.toLowerCase() 
            ? <span key={`${word}-${i}`} className={`${color}`}>{part}</span> 
            : part
        );
      });
    });
    return elements;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Top Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                <ShieldCheck className="text-gold-400" size={20} />
            </div>
            <div>
               <h2 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">Institutional Strategist</h2>
               <p className="text-white font-bold">{user.name}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="text-right">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Market Gold (24K)</p>
               <p className="text-white font-mono font-bold tracking-tighter">₹{goldPrice}</p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-right">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Strategic Karma</p>
               <div className="flex items-center gap-2 justify-end">
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full bg-gradient-to-r from-emerald-500 to-gold-500" style={{width: `${user.karmaScore}%`}}></div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">{user.karmaScore}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Primary Wisdom Banner - CHANAKYA NITI (ABSOLUTE TOP) */}
      <div className="relative p-10 rounded-[3.5rem] bg-gradient-to-br from-[#1a1c20] to-black border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-[0.02] transform translate-x-1/4 -translate-y-1/4 group-hover:scale-105 transition-transform duration-1000 pointer-events-none">
            <Quote size={320} className="text-gold-500" />
         </div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(202,138,4,0.05),transparent_50%)]"></div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2.5 bg-gold-500/10 rounded-2xl border border-gold-500/20">
                  <BookOpen size={20} className="text-gold-400" />
               </div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-gold-500">Acharya's Strategic Guidance</h3>
            </div>
            <p className="text-3xl md:text-5xl font-serif text-slate-100 leading-[1.2] tracking-tight italic max-w-5xl">
               "{niti}"
            </p>
            <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-0.5 bg-gold-500/30"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">KAUTILYA ARTHASHASTRA PROTOCOL</p>
               </div>
               <button className="text-[10px] font-black uppercase tracking-widest text-gold-400 hover:text-white hover:scale-105 transition-all">Request Deeper Consultation</button>
            </div>
         </div>
      </div>

      {/* Wealth Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Net Worth Glass Card */}
         <div className="lg:col-span-8 p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/10 relative overflow-hidden group shadow-2xl backdrop-blur-xl">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start relative z-10 gap-8">
               <div className="space-y-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                     <Globe size={14} className="text-gold-400" /> Capital Deployed Locally
                  </p>
                  <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter">
                     {user.currencySymbol}{currentNetWorth.toLocaleString('en-IN')}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                     <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <ArrowUpRight size={14} /> Total Growth
                     </div>
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Data Encrypted On-Device</span>
                  </div>
               </div>
               <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col items-center min-w-[140px] backdrop-blur-md">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Solvency Index</p>
                  <span className={`text-5xl font-black ${healthScore > 50 ? 'text-emerald-400' : 'text-orange-400'}`}>{Math.round(healthScore)}</span>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                     <div className={`h-full ${healthScore > 50 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{width: `${healthScore}%`}}></div>
                  </div>
               </div>
            </div>

            <div className="mt-14 h-48 w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    {v: currentNetWorth * 0.75}, {v: currentNetWorth * 0.8}, {v: currentNetWorth * 0.9}, 
                    {v: currentNetWorth * 0.85}, {v: currentNetWorth * 0.95}, {v: currentNetWorth}
                  ]}>
                     <defs>
                        <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#CA8A04" stopOpacity={0.25}/>
                           <stop offset="95%" stopColor="#CA8A04" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="v" stroke="#CA8A04" strokeWidth={4} fillOpacity={1} fill="url(#wealthGradient)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Market Pulse Widget */}
         <div className="lg:col-span-4 p-10 rounded-[3.5rem] bg-[#121418] border border-white/10 backdrop-blur-2xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-10 relative z-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-gold-500 flex items-center gap-3">
                  <Activity size={18} className="animate-pulse" /> Global Signals
               </h3>
               <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
               </div>
            </div>

            <div className="space-y-8 flex-1 relative z-10">
               {headlines.length > 0 ? headlines.map((h, i) => (
                  <div key={i} className="group cursor-default border-l border-white/5 pl-6 py-1 hover:border-gold-500 transition-all duration-300">
                     <span className="text-[9px] font-black text-slate-600 block mb-2 uppercase tracking-[0.3em]">Signal Source 0{i+1}</span>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                        {formatHeadline(h)}
                     </p>
                  </div>
               )) : (
                  [1,2,3].map(i => (
                     <div key={i} className="h-12 bg-white/5 rounded-2xl animate-pulse mb-6"></div>
                  ))
               )}
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/5 text-[9px] text-slate-600 font-black uppercase tracking-[0.5em] flex justify-between">
               <span>Cognitive Feed</span>
               <span>v3.5 Active</span>
            </div>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center gap-6 hover:bg-white/[0.05] transition-all hover:border-white/10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-xl">
               <Flame size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Burn Velocity</p>
               <p className="text-3xl font-black text-white">₹{Math.round(totalExpense / 30).toLocaleString('en-IN')}</p>
            </div>
         </div>

         <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center gap-6 hover:bg-white/[0.05] transition-all hover:border-white/10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-xl">
               <Scale size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Defense Multiplier</p>
               <p className="text-3xl font-black text-white">{(currentNetWorth/totalExpense).toFixed(1)}x</p>
            </div>
         </div>

         <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center gap-6 hover:bg-white/[0.05] transition-all hover:border-white/10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-xl">
               <Zap size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Capital Retention</p>
               <p className="text-3xl font-black text-white">{savingsRate.toFixed(1)}%</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { UserProfile, PurchaseImpact } from '../types';
import { analyzePurchaseImpact } from '../services/geminiService';
import { Hourglass, TrendingUp, ShoppingBag, ArrowRight, HeartPulse, Users, Leaf, Zap, Loader2 } from 'lucide-react';

interface SimulatorProps {
  user: UserProfile;
}

const Simulator: React.FC<SimulatorProps> = ({ user }) => {
  const [price, setPrice] = useState('');
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    timeCost: number; 
    opportunityCost: number; 
    impact: PurchaseImpact | null;
  } | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(price);
    if (!cost || !itemName) return;

    setLoading(true);

    // Math Logic
    const dailyIncome = user.monthlyIncome / 30;
    const timeCostDays = cost / dailyIncome;
    const r = 0.12; 
    const n = 20;
    const opportunityCost = cost * Math.pow((1 + r), n);

    // AI Logic
    const impact = await analyzePurchaseImpact(itemName, cost, user.currencySymbol);

    setResult({
      timeCost: timeCostDays,
      opportunityCost,
      impact
    });
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBar = (score: number) => {
     let colorClass = 'bg-red-500';
     if (score >= 40) colorClass = 'bg-yellow-500';
     if (score >= 70) colorClass = 'bg-emerald-500';

     return (
       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
         <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
       </div>
     );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Input Section */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
               <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Purchase Simulator</h2>
              <p className="text-sm text-slate-400">Consult the Algorithm.</p>
            </div>
          </div>

          <form onSubmit={handleSimulate} className="space-y-4">
            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Item Name</label>
              <input 
                type="text" 
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="e.g. PS5 Console"
                className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Price ({user.currencySymbol})</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <>Analyze Impact <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed">
             <Zap size={14} className="inline mr-1 text-gold-400"/>
             The simulator uses AI to evaluate not just financial cost, but impact on your health, social life, and sustainability.
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8">
        {result ? (
          <div className="space-y-6 animate-fade-in">
             
             {/* Verdict Banner */}
             {result.impact && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/80 to-slate-900/80 border border-purple-500/30">
                  <h3 className="text-sm font-bold text-purple-300 uppercase mb-1">Final Verdict</h3>
                  <p className="text-2xl text-white font-light italic">"{result.impact.verdict}"</p>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Cost Card */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">Life Energy Cost</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-bold text-white">{result.timeCost.toFixed(1)}</h2>
                        <span className="text-slate-500">days of work</span>
                    </div>
                    <Hourglass className="absolute right-4 bottom-4 opacity-10" size={60} />
                </div>

                {/* Opportunity Cost Card */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">If Invested (20Y)</p>
                     <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-bold text-indigo-300">{user.currencySymbol}{Math.round(result.opportunityCost / 1000)}k</h2>
                        <span className="text-slate-500">value</span>
                    </div>
                    <TrendingUp className="absolute right-4 bottom-4 opacity-10" size={60} />
                </div>
             </div>

             {/* Deep Impact Grid */}
             {result.impact && (
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                 <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <Zap size={20} className="text-gold-400"/> Deep Impact Analysis
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Health */}
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 text-slate-300">
                             <HeartPulse size={16} /> Health Impact
                          </div>
                          <span className={`font-bold ${getScoreColor(result.impact.healthScore)}`}>{result.impact.healthScore}/100</span>
                       </div>
                       {getScoreBar(result.impact.healthScore)}
                    </div>

                    {/* Social */}
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 text-slate-300">
                             <Users size={16} /> Social Value
                          </div>
                          <span className={`font-bold ${getScoreColor(result.impact.socialScore)}`}>{result.impact.socialScore}/100</span>
                       </div>
                       {getScoreBar(result.impact.socialScore)}
                    </div>

                    {/* Utility */}
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 text-slate-300">
                             <Zap size={16} /> Utility
                          </div>
                          <span className={`font-bold ${getScoreColor(result.impact.utilityScore)}`}>{result.impact.utilityScore}/100</span>
                       </div>
                       {getScoreBar(result.impact.utilityScore)}
                    </div>

                    {/* Sustainability */}
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 text-slate-300">
                             <Leaf size={16} /> Eco Score
                          </div>
                          <span className={`font-bold ${getScoreColor(result.impact.sustainabilityScore)}`}>{result.impact.sustainabilityScore}/100</span>
                       </div>
                       {getScoreBar(result.impact.sustainabilityScore)}
                    </div>
                 </div>

                 {/* AI Suggestion */}
                 <div className="mt-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-indigo-200 text-sm font-medium">
                       <span className="font-bold uppercase text-xs tracking-wider mr-2 bg-indigo-500 text-white px-2 py-0.5 rounded">Better Idea</span>
                       {result.impact.alternativeSuggestion}
                    </p>
                 </div>
               </div>
             )}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 border-2 border-dashed border-slate-800 rounded-2xl min-h-[400px]">
            {loading ? (
                <div className="text-center space-y-4">
                    <Loader2 size={48} className="animate-spin text-purple-500 mx-auto" />
                    <p>Consulting Chanakya & The Stars...</p>
                </div>
            ) : (
                <>
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="text-center max-w-xs">Enter item details to get a comprehensive financial and lifestyle impact analysis.</p>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulator;
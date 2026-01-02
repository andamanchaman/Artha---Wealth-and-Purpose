import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, UserProfile } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, AlertTriangle, Coins, TrendingDown, Target, Zap, Calculator, Calendar, Newspaper, Flame, Coffee, Activity, Globe, Scale, Lock, RefreshCcw } from 'lucide-react';
import { getMarketNews, getSpendingInsight, getGoldPrice } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  user: UserProfile;
}

const QUOTES = [
  "Jo vyakti apne aay se adhik kharch karta hai, uska vinash nishchit hai.",
  "Dhan usi ke paas tikta hai jo uska samman karta hai.",
  "Sankat ke samay bachaya hua dhan hi sabse bada mitra hota hai.",
  "Rin (Karz), Shatru aur Rog - inhe shesh nahi rakhna chahiye.",
  "Vidya se badi koi daulat nahi, aur santosh se bada koi sukh nahi."
];

const COLORS = ['#10B981', '#FACC15', '#EF4444', '#6366F1', '#EC4899', '#8B5CF6', '#F97316'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, user }) => {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [goldPrice, setGoldPrice] = useState<string>("72,000");
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Basic Stats Calculation
  const now = new Date();
  
  // Filter transactions for History (Net Worth) vs Future (Liabilities)
  const historyTransactions = transactions.filter(t => new Date(t.date).getTime() <= new Date().getTime());
  const futureTransactions = transactions.filter(t => new Date(t.date).getTime() > new Date().getTime());

  const totalIncome = historyTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = historyTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  // Net Worth = Initial Savings + Income - Expenses
  const initialWealth = user.currentSavings || 0;
  const currentNetWorth = (initialWealth + totalIncome) - totalExpense; 

  // 1. Burn Rate (Spending Speed)
  const currentDay = now.getDate();
  const burnRate = totalExpense / Math.max(1, currentDay); // Amt per day
  const allowedBurnRate = user.monthlyIncome / 30;
  const isBurningFast = burnRate > allowedBurnRate;

  // 2. Category Calculation
  const expensesByCategory = historyTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const topCategory = chartData.sort((a,b) => b.value - a.value)[0];

  // 3. Wealth Projection (6 Months)
  const monthlySavings = user.monthlyIncome - (totalExpense / Math.max(1, currentDay) * 30);
  const projectionData = Array.from({length: 6}, (_, i) => ({
    month: `M${i+1}`,
    wealth: currentNetWorth + (monthlySavings * (i+1))
  }));

  // 4. Chai Index
  const foodExpense = expensesByCategory['Food'] || 0;
  const cupsOfChai = Math.floor(foodExpense / 20); // Assuming 20rs per cup

  // 5. Tax Estimate (Simplified Flat 10% for demo)
  const estimatedTax = (user.monthlyIncome * 12) * 0.10;

  // 6. Emergency Fund (Goal: 6x Income)
  const emergencyFundTarget = user.monthlyIncome * 6;
  const emergencyFundProgress = Math.min((currentNetWorth / emergencyFundTarget) * 100, 100);

  // Effect for Independent Data (News, Gold)
  useEffect(() => {
    getMarketNews().then(setHeadlines);
    getGoldPrice().then(setGoldPrice);
  }, []);

  // Effect for Dependent Data (Insight)
  useEffect(() => {
    if(topCategory) {
        getSpendingInsight(topCategory.name, topCategory.value).then(setInsight);
    }
  }, [topCategory?.name, topCategory?.value]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Wisdom Banner */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-amber-900/40 to-slate-900/40 border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Coins size={100} />
        </div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <h3 className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-1">Chanakya Niti</h3>
                <p className="text-xl md:text-2xl font-light italic text-slate-100 font-serif">"{randomQuote}"</p>
            </div>
            {/* Gold Ticker */}
            <div className="hidden md:block bg-black/30 p-2 rounded-lg backdrop-blur-sm border border-gold-500/20">
                <p className="text-xs text-gold-400 uppercase font-bold">Gold (10g)</p>
                <p className="text-lg font-mono text-white">₹{goldPrice}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT MAIN COLUMN */}
        <div className="md:col-span-8 space-y-6">
            
            {/* 1. Net Worth & News Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between min-h-[200px] group hover:bg-white/10 transition-colors">
                    <div>
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-2"><Globe size={14}/> Total Net Worth</p>
                        <h2 className="text-4xl font-bold text-white tracking-tight">
                        {user.currencySymbol} {currentNetWorth.toLocaleString('en-IN')}
                        </h2>
                    </div>
                    
                    {/* Rich List Percentile (Mock) */}
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs text-emerald-300">
                           <TrendingUp size={12} className="inline mr-1"/>
                           You are richer than <strong>{Math.min(99, Math.floor((user.monthlyIncome/1000) * 1.5))}%</strong> of the world.
                        </p>
                    </div>
                </div>

                {/* Market Pulse (News) */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col">
                     <div className="flex items-center justify-between mb-3">
                        <h4 className="text-gold-400 text-sm font-bold uppercase flex items-center gap-2"><Newspaper size={16}/> Market Pulse</h4>
                        <span className="text-[10px] bg-red-500 text-white px-1.5 rounded animate-pulse">LIVE</span>
                     </div>
                     <div className="flex-1 space-y-3 overflow-hidden">
                        {headlines.length > 0 ? headlines.map((news, i) => (
                            <div key={i} className="flex gap-2 items-start text-xs text-slate-300 border-b border-white/5 pb-2 last:border-0">
                                <span className="text-slate-500 mt-0.5">•</span>
                                <span>{news}</span>
                            </div>
                        )) : <p className="text-xs text-slate-500">Scanning markets...</p>}
                     </div>
                </div>
            </div>

            {/* 2. Wealth Projection Chart */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2"><Activity size={18} className="text-purple-400"/> Wealth Projection</h3>
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">6 Month Forecast</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#10B981' }}
                            />
                            <Area type="monotone" dataKey="wealth" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorWealth)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Stats Row (Velocity, Tax, Chai) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Burn Rate */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-400 text-xs font-bold uppercase">Burn Rate</h4>
                      <Flame size={16} className={isBurningFast ? "text-red-500" : "text-emerald-500"} />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-1">₹{Math.round(burnRate)}<span className="text-xs text-slate-500 font-normal">/day</span></h3>
                   <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                       <div 
                         className={`h-full rounded-full ${isBurningFast ? 'bg-red-500' : 'bg-emerald-500'}`} 
                         style={{ width: `${Math.min((burnRate / (allowedBurnRate*1.5))*100, 100)}%`}} 
                       />
                   </div>
                   <p className="text-[10px] text-slate-500 mt-2">Limit: ₹{Math.round(allowedBurnRate)}/day</p>
                </div>

                {/* Tax Estimator */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-400 text-xs font-bold uppercase">Tax Liability</h4>
                      <Scale size={16} className="text-blue-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white">₹{(estimatedTax/1000).toFixed(1)}k</h3>
                   <p className="text-[10px] text-slate-500 mt-1">Est. annual (Old Regime)</p>
                </div>

                {/* Chai Index */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-400 text-xs font-bold uppercase">Chai Index</h4>
                      <Coffee size={16} className="text-amber-600" />
                   </div>
                   <h3 className="text-2xl font-bold text-white">{cupsOfChai} <span className="text-xs text-slate-500 font-normal">cups</span></h3>
                   <p className="text-[10px] text-slate-500 mt-1">spent on Food/Drink</p>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN (Widgets) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Upcoming Liabilities */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
             <div className="flex items-center gap-2 mb-4 text-white">
               <Calendar size={18} className="text-blue-400" />
               <span className="text-sm font-bold uppercase">Liabilities Forecast</span>
             </div>
             <div className="space-y-3">
               {futureTransactions.length > 0 ? futureTransactions.slice(0, 3).map(t => (
                   <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                          <p className="text-sm font-medium text-slate-200">{t.description}</p>
                          <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-red-300">-₹{t.amount}</span>
                   </div>
               )) : (
                   <p className="text-xs text-slate-500 italic text-center py-4">No upcoming bills scheduled.</p>
               )}
             </div>
          </div>

          {/* Safety Net (Emergency Fund) */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-emerald-500"></div>
             <div className="flex justify-center mb-2 text-emerald-400"><Lock size={24} /></div>
             <h4 className="text-white font-bold mb-1">Safety Net</h4>
             <p className="text-xs text-slate-400 mb-4">Goal: ₹{(emergencyFundTarget/100000).toFixed(1)} Lakhs</p>
             
             <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${emergencyFundProgress}%` }}></div>
             </div>
             <p className="mt-2 text-xs font-mono text-emerald-300">{emergencyFundProgress.toFixed(1)}% Secured</p>
          </div>
          
          {/* Smart Category Insight */}
          {topCategory && (
              <div className="p-5 rounded-2xl bg-purple-900/20 border border-purple-500/30">
                 <div className="flex items-center gap-2 mb-2 text-purple-300">
                    <Zap size={16} />
                    <span className="text-xs font-bold uppercase">Spending Insight</span>
                 </div>
                 <p className="text-sm text-slate-200 italic leading-relaxed">
                   "{insight || "Vittiya visleshan chal raha hai..."}"
                 </p>
                 <p className="text-[10px] text-purple-400 mt-2 text-right">- Chanakya AI on '{topCategory.name}'</p>
              </div>
          )}

          {/* Subscription Detective */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
             <div className="flex items-center gap-2 mb-4 text-slate-300">
               <RefreshCcw size={16} />
               <span className="text-xs font-bold uppercase">Subscription Detective</span>
             </div>
             <div className="flex flex-wrap gap-2">
                {['Netflix', 'Spotify', 'Amazon', 'Hotstar', 'Gym'].map(sub => {
                    const found = historyTransactions.some(t => t.description.toLowerCase().includes(sub.toLowerCase()));
                    return found ? (
                        <span key={sub} className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs border border-red-500/30">{sub}</span>
                    ) : null;
                })}
                {/* Fallback if none found */}
                {!historyTransactions.some(t => ['netflix','spotify','amazon','hotstar','gym'].some(s => t.description.toLowerCase().includes(s))) && 
                    <span className="text-xs text-slate-500">No active subs detected.</span>
                }
             </div>
          </div>

          {/* Inflation Time Machine */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
             <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Inflation Time Machine</h4>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Your Goal Today</span>
                <span className="text-white font-bold">₹{(user.targetAmount/100000).toFixed(1)}L</span>
             </div>
             <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-slate-500">In 2014</span>
                <span className="text-emerald-400 font-mono">₹{((user.targetAmount * 0.55)/100000).toFixed(1)}L</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
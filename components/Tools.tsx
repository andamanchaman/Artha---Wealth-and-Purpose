
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Car, Home, TrendingUp, Clock, Youtube, 
  Flame, Briefcase, ShieldCheck, HeartPulse, 
  Zap, Percent, DollarSign, School, UserPlus,
  ArrowRight, Check, X, Building, Loader2,
  ShoppingBag, Rocket
} from 'lucide-react';
import { estimateYoutubeIncome, checkFundOverlap } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PublishingGuide from './PublishingGuide';

interface ToolsProps {
  user: UserProfile;
}

const TOOL_CATEGORIES = [
  { id: 'buying', label: 'Buying Rules', icon: ShoppingBag },
  { id: 'investing', label: 'Investing', icon: TrendingUp },
  { id: 'income', label: 'Income & Career', icon: Briefcase },
  { id: 'life', label: 'Life Planning', icon: HeartPulse },
];

const Tools: React.FC<ToolsProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState('buying');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // --- Calculator States ---
  const [carPrice, setCarPrice] = useState(1500000);
  const [housePrice, setHousePrice] = useState(7500000);
  const [sipAmount, setSipAmount] = useState(5000);
  const [stepUpRate, setStepUpRate] = useState(10);
  const [ytNiche, setYtNiche] = useState('Tech');
  const [ytViews, setYtViews] = useState(10000);
  const [ytVideos, setYtVideos] = useState(4);
  const [ytResult, setYtResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fundsList, setFundsList] = useState('');
  const [overlapResult, setOverlapResult] = useState('');
  
  // New States
  const [rentAmount, setRentAmount] = useState(25000);
  const [buyPropertyPrice, setBuyPropertyPrice] = useState(7500000);
  const [interestRate72, setInterestRate72] = useState(12);
  const [freelanceTarget, setFreelanceTarget] = useState(100000);
  const [billableHours, setBillableHours] = useState(100);
  const [currentAge, setCurrentAge] = useState(25);
  const [monthlyExpense, setMonthlyExpense] = useState(30000);
  
  // --- Helpers ---
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // --- Logic Implementations ---
  
  // 1. Car: 20/4/10 Rule
  const carDownPayment = carPrice * 0.20;
  const carLoanAmt = carPrice * 0.80;
  const carRate = 0.095; // 9.5%
  const carTenureMonths = 4 * 12;
  const carEMI = (carLoanAmt * carRate/12 * Math.pow(1 + carRate/12, carTenureMonths)) / (Math.pow(1 + carRate/12, carTenureMonths) - 1);
  const carIsAffordable = carEMI <= (user.monthlyIncome * 0.10);

  // 2. House: 3/20/30/40 Rule
  const maxAffordableHouse = user.monthlyIncome * 12 * 3;
  const houseLoanAmt = housePrice * 0.60; // Assuming 40% down
  const houseRate = 0.085; // 8.5%
  const houseTenure = 20 * 12;
  const houseEMI = (houseLoanAmt * houseRate/12 * Math.pow(1 + houseRate/12, houseTenure)) / (Math.pow(1 + houseRate/12, houseTenure) - 1);
  const houseChecks = {
     price: housePrice <= maxAffordableHouse,
     emi: houseEMI <= (user.monthlyIncome * 0.30),
     downPayment: housePrice * 0.40
  };

  // 3. Step Up SIP
  const calculateStepUp = () => {
    let data = [];
    let currentAmount = 0;
    let monthlyInv = sipAmount;
    const rate = 12 / 100 / 12; // 12% annual
    for (let year = 1; year <= 20; year++) {
      for (let m = 1; m <= 12; m++) {
        currentAmount = (currentAmount + monthlyInv) * (1 + rate);
      }
      data.push({ year: `Y${year}`, value: Math.round(currentAmount), invested: Math.round(monthlyInv * 12 * year) });
      monthlyInv = monthlyInv * (1 + stepUpRate/100);
    }
    return data;
  };
  const stepUpData = calculateStepUp();

  // 4. Cost of Delay (5 Years)
  const costOfDelayData = (() => {
      const rate = 0.12;
      const startNow = 5000 * (((Math.pow(1+rate/12, 30*12)-1)/(rate/12)) * (1+rate/12)); // 30 years
      const startLater = 5000 * (((Math.pow(1+rate/12, 25*12)-1)/(rate/12)) * (1+rate/12)); // 25 years
      return { startNow, startLater, loss: startNow - startLater };
  })();

  // 5. YT Estimator
  const handleYtEstimate = async () => {
    setLoading(true);
    const res = await estimateYoutubeIncome(ytNiche, ytViews, ytVideos);
    setYtResult(res);
    setLoading(false);
  };

  // 6. Fund Overlap
  const handleOverlap = async () => {
    setLoading(true);
    const res = await checkFundOverlap(fundsList);
    setOverlapResult(res);
    setLoading(false);
  }

  // 7. FIRE Calculator
  const fireCorpus = monthlyExpense * 12 * 25;
  
  // 8. Rent vs Buy
  const priceToRentRatio = buyPropertyPrice / (rentAmount * 12);
  let rentVerdict = "Buy";
  if (priceToRentRatio > 25) rentVerdict = "Rent";
  else if (priceToRentRatio > 20) rentVerdict = "Neutral";

  // 9. Rule 72
  const yearsToDouble = 72 / interestRate72;

  // 10. Freelance
  const freelanceRate = (freelanceTarget * 1.3) / billableHours; // 30% buffer

  const renderToolContent = () => {
    switch(activeTool) {
      case 'car':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Car className="text-blue-400"/> The 20/4/10 Rule</h3>
            <p className="text-sm text-slate-400">Buying a car? You can afford it if: You pay 20% down, Loan tenure is max 4 years, and EMI is max 10% of monthly income.</p>
            
            <div className="space-y-4 bg-white/5 p-4 rounded-xl">
               <div>
                  <label className="text-xs uppercase text-slate-500">Car Price</label>
                  <input type="range" min={500000} max={10000000} step={100000} value={carPrice} onChange={e => setCarPrice(Number(e.target.value))} className="w-full accent-gold-500"/>
                  <div className="flex justify-between text-white font-mono">
                     <span>₹5L</span>
                     <span className="text-gold-400 font-bold">{formatCurrency(carPrice)}</span>
                     <span>₹1Cr</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 gap-2 text-center mt-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                     <p className="text-xs text-slate-400">Down Payment (20%)</p>
                     <p className="font-bold text-white">{formatCurrency(carDownPayment)}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                     <p className="text-xs text-slate-400">Loan (4 Yrs)</p>
                     <p className="font-bold text-white">{formatCurrency(carLoanAmt)}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                     <p className="text-xs text-slate-400">EMI (calculated)</p>
                     <p className={`font-bold ${carIsAffordable ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(carEMI)}</p>
                  </div>
               </div>

               <div className={`p-4 rounded-lg flex items-center gap-3 ${carIsAffordable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {carIsAffordable ? <Check size={24}/> : <X size={24}/>}
                  <div>
                    <p className="font-bold">{carIsAffordable ? "You can afford this car!" : "This car is a liability trap."}</p>
                    <p className="text-xs opacity-80">Your Max Affordability Limit: EMI {formatCurrency(user.monthlyIncome * 0.10)}</p>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'house':
         return (
           <div className="space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2"><Home className="text-emerald-400"/> The 3/20/30/40 Rule</h3>
             <p className="text-sm text-slate-400">House Price &lt; 3x Annual Income, 20 Yr Loan, EMI &lt; 30% Income, 40% Down Payment.</p>
             <div className="bg-white/5 p-4 rounded-xl space-y-4">
               <div>
                  <label className="text-xs uppercase text-slate-500">House Price</label>
                  <input type="range" min={2000000} max={50000000} step={500000} value={housePrice} onChange={e => setHousePrice(Number(e.target.value))} className="w-full accent-emerald-500"/>
                  <div className="text-center font-bold text-emerald-400 text-xl">{formatCurrency(housePrice)}</div>
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between items-center p-2 border-b border-white/5">
                   <span className="text-sm text-slate-300">Rule 1: Price &lt; 3x Income ({formatCurrency(maxAffordableHouse)})</span>
                   {houseChecks.price ? <Check className="text-emerald-400" size={16}/> : <X className="text-red-400" size={16}/>}
                 </div>
                 <div className="flex justify-between items-center p-2 border-b border-white/5">
                   <span className="text-sm text-slate-300">Rule 2: EMI ({formatCurrency(houseEMI)}) &lt; 30% Income</span>
                   {houseChecks.emi ? <Check className="text-emerald-400" size={16}/> : <X className="text-red-400" size={16}/>}
                 </div>
                 <div className="flex justify-between items-center p-2">
                   <span className="text-sm text-slate-300">Rule 3: Down Payment ({formatCurrency(houseChecks.downPayment)}) Ready?</span>
                   <span className="text-xs text-slate-500 uppercase">You Check</span>
                 </div>
               </div>
             </div>
           </div>
         );

      case 'rentvsbuy':
         return (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Building className="text-blue-400"/> Rent vs Buy</h3>
              <p className="text-sm text-slate-400">Using the Price-to-Rent Ratio. If ratio &gt; 25, renting is financially better.</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs text-slate-500">Monthly Rent</label>
                   <input type="number" value={rentAmount} onChange={e => setRentAmount(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
                 </div>
                 <div>
                   <label className="text-xs text-slate-500">Property Price</label>
                   <input type="number" value={buyPropertyPrice} onChange={e => setBuyPropertyPrice(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
                 </div>
              </div>

              <div className="p-6 bg-white/5 rounded-xl text-center border border-white/10">
                 <p className="text-slate-400 mb-2">Price-to-Rent Ratio</p>
                 <p className="text-4xl font-bold text-white mb-4">{priceToRentRatio.toFixed(1)}</p>
                 
                 <div className={`inline-block px-4 py-2 rounded-full font-bold ${rentVerdict === 'Rent' ? 'bg-emerald-500 text-emerald-950' : rentVerdict === 'Buy' ? 'bg-gold-500 text-gold-950' : 'bg-slate-500 text-white'}`}>
                    Verdict: {rentVerdict}
                 </div>
              </div>
            </div>
         );

      case 'stepup':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-purple-400"/> Step-Up SIP Magic</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500">Initial SIP</label>
                <input type="number" value={sipAmount} onChange={e => setSipAmount(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-white"/>
              </div>
              <div>
                <label className="text-xs text-slate-500">Annual Step Up %</label>
                <input type="number" value={stepUpRate} onChange={e => setStepUpRate(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-white"/>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stepUpData}>
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155'}}/>
                    <XAxis dataKey="year" hide/>
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Total Value"/>
                 </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">After 20 Years</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(stepUpData[19].value)}</p>
              <p className="text-xs text-purple-400">Without Step-Up: {formatCurrency(sipAmount * 12 * ((Math.pow(1.12,20)-1)/0.12)*1.12)}</p>
            </div>
          </div>
        );
      
      case 'rule72':
         return (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Percent className="text-green-400"/> Rule of 72</h3>
              <p className="text-sm text-slate-400">How long will it take to double your money?</p>
              
              <div>
                 <label className="text-xs text-slate-500">Interest Rate (%)</label>
                 <input type="number" value={interestRate72} onChange={e => setInterestRate72(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
              </div>

              <div className="p-8 bg-gradient-to-r from-green-900/40 to-slate-900 rounded-xl flex items-center justify-between border border-green-500/30">
                 <div>
                    <p className="text-slate-400 text-sm">Your money doubles in</p>
                    <p className="text-4xl font-bold text-white">{yearsToDouble.toFixed(1)} <span className="text-lg font-normal text-slate-500">Years</span></p>
                 </div>
                 <TrendingUp size={48} className="text-green-500/50" />
              </div>
            </div>
         );

      case 'youtube':
        return (
          <div className="space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2"><Youtube className="text-red-500"/> YouTuber Income Estimator</h3>
             <div className="space-y-3">
                <input value={ytNiche} onChange={e => setYtNiche(e.target.value)} placeholder="Niche (e.g. Tech, Vlog)" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"/>
                <input type="number" value={ytViews} onChange={e => setYtViews(Number(e.target.value))} placeholder="Avg Views per Video" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"/>
                <input type="number" value={ytVideos} onChange={e => setYtVideos(Number(e.target.value))} placeholder="Uploads per Month" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"/>
                <button onClick={handleYtEstimate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-bold text-white flex justify-center">
                   {loading ? <Loader2 className="animate-spin"/> : "Estimate Earnings"}
                </button>
             </div>
             {ytResult && (
               <div className="bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in">
                  <div className="flex justify-between mb-2">
                     <div>
                       <p className="text-xs text-slate-400">Low Estimate</p>
                       <p className="font-bold text-white">{formatCurrency(ytResult.low)}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-slate-400">High Estimate</p>
                       <p className="font-bold text-white">{formatCurrency(ytResult.high)}</p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-400 italic mt-2">{ytResult.explanation}</p>
               </div>
             )}
          </div>
        );

      case 'freelance':
         return (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign className="text-gold-400"/> Freelance Rate Calculator</h3>
              <p className="text-sm text-slate-400">Includes a 30% buffer for taxes, insurance, and dry spells.</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs text-slate-500">Target Monthly Income</label>
                   <input type="number" value={freelanceTarget} onChange={e => setFreelanceTarget(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
                 </div>
                 <div>
                   <label className="text-xs text-slate-500">Billable Hours / Month</label>
                   <input type="number" value={billableHours} onChange={e => setBillableHours(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
                 </div>
              </div>

              <div className="p-6 bg-gold-900/20 rounded-xl text-center border border-gold-500/30">
                 <p className="text-slate-400 text-sm mb-2">You should charge at least</p>
                 <p className="text-4xl font-bold text-gold-400">{formatCurrency(freelanceRate)}<span className="text-lg text-slate-500">/hr</span></p>
              </div>
            </div>
         );

      case 'overlap':
        return (
          <div className="space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2"><Zap className="text-yellow-400"/> Mutual Fund Overlap</h3>
             <textarea 
               value={fundsList} 
               onChange={e => setFundsList(e.target.value)} 
               placeholder="Enter your mutual funds separated by comma (e.g. Axis Bluechip, HDFC Top 100)" 
               className="w-full h-24 bg-slate-800 p-3 rounded-xl text-white border border-slate-700 focus:outline-none"
             />
             <button onClick={handleOverlap} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded-xl font-bold text-white flex justify-center">
               {loading ? <Loader2 className="animate-spin"/> : "Check Overlap"}
             </button>
             {overlapResult && (
               <div className="bg-slate-800/50 p-4 rounded-xl text-sm leading-relaxed text-slate-200 border border-white/5">
                 {overlapResult}
               </div>
             )}
          </div>
        );

      case 'delay':
         return (
           <div className="space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-orange-400"/> Cost of Delay (FOMO)</h3>
             <p className="text-sm text-slate-400">If you wait 5 years to start investing ₹5,000/mo (at 12%), how much do you lose by year 30?</p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
                   <p className="text-xs text-emerald-400">Start Today</p>
                   <p className="text-xl font-bold text-white">{formatCurrency(costOfDelayData.startNow)}</p>
                </div>
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
                   <p className="text-xs text-red-400">Start after 5 Yrs</p>
                   <p className="text-xl font-bold text-white">{formatCurrency(costOfDelayData.startLater)}</p>
                </div>
             </div>
             <div className="p-6 bg-white/5 rounded-xl text-center">
                <p className="text-slate-400 mb-1">Total Loss</p>
                <p className="text-4xl font-bold text-red-500">{formatCurrency(costOfDelayData.loss)}</p>
                <p className="text-xs text-slate-500 mt-2">Cost of a luxury car, just by waiting.</p>
             </div>
           </div>
         );

      case 'fire':
         return (
            <div className="space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2"><Flame className="text-orange-500"/> FIRE Calculator</h3>
               <p className="text-sm text-slate-400">Financial Independence, Retire Early. The 25x Rule.</p>
               
               <div>
                  <label className="text-xs text-slate-500">Monthly Expense</label>
                  <input type="number" value={monthlyExpense} onChange={e => setMonthlyExpense(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
               </div>

               <div className="p-6 bg-gradient-to-r from-orange-900/40 to-slate-900 rounded-xl text-center border border-orange-500/30">
                  <p className="text-slate-400 text-sm mb-2">You need a corpus of</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(fireCorpus)}</p>
                  <p className="text-xs text-slate-500 mt-2">To retire and live on withdrawals.</p>
               </div>
            </div>
         );

      case 'emergency':
         return (
            <div className="space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> Emergency Fund</h3>
               <p className="text-sm text-slate-400">Keep 6 months of expenses liquid.</p>
               
               <div>
                  <label className="text-xs text-slate-500">Monthly Expense</label>
                  <input type="number" value={monthlyExpense} onChange={e => setMonthlyExpense(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                     <p className="text-xs text-slate-400 mb-1">Minimum (3 Months)</p>
                     <p className="text-xl font-bold text-white">{formatCurrency(monthlyExpense * 3)}</p>
                  </div>
                  <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                     <p className="text-xs text-emerald-400 mb-1">Recommended (6 Months)</p>
                     <p className="text-xl font-bold text-white">{formatCurrency(monthlyExpense * 6)}</p>
                  </div>
               </div>
            </div>
         );

      case '100age':
         return (
            <div className="space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2"><HeartPulse className="text-pink-500"/> 100 - Age Rule</h3>
               <p className="text-sm text-slate-400">Asset Allocation Strategy.</p>
               
               <div>
                  <label className="text-xs text-slate-500">Your Age</label>
                  <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700"/>
               </div>

               <div className="flex items-center gap-4 mt-4">
                  <div className="flex-1 p-6 bg-pink-600/20 border border-pink-500/30 rounded-2xl text-center">
                     <p className="text-3xl font-bold text-white">{100 - currentAge}%</p>
                     <p className="text-xs text-pink-300 uppercase font-bold mt-1">Equity</p>
                     <p className="text-[10px] text-slate-400">(Stocks/Mutual Funds)</p>
                  </div>
                  <div className="flex-1 p-6 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-center">
                     <p className="text-3xl font-bold text-white">{Math.min(100, currentAge)}%</p>
                     <p className="text-xs text-blue-300 uppercase font-bold mt-1">Debt</p>
                     <p className="text-[10px] text-slate-400">(FD/Bonds/Gold)</p>
                  </div>
               </div>
            </div>
         );

      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <School size={48} className="mb-4 opacity-20"/>
               <p>Select a strategy from the grid to begin.</p>
            </div>
        );
    }
  };

  const getToolsByCategory = () => {
    switch(activeCategory) {
       case 'buying':
         return [
           { id: 'car', name: 'Car Affordability', icon: Car, desc: '20/4/10 Rule' },
           { id: 'house', name: 'House Affordability', icon: Home, desc: '3/20/30/40 Rule' },
           { id: 'rentvsbuy', name: 'Rent vs Buy', icon: Building, desc: 'Math Comparison' },
         ];
       case 'investing':
         return [
           { id: 'stepup', name: 'Step-Up SIP', icon: TrendingUp, desc: 'Power of compounding' },
           { id: 'delay', name: 'Cost of Delay', icon: Clock, desc: 'FOMO Calculator' },
           { id: 'overlap', name: 'Fund Overlap', icon: Zap, desc: 'AI Analyzer' },
           { id: 'rule72', name: 'Rule of 72', icon: Percent, desc: 'Double your money' },
         ];
       case 'income':
         return [
           { id: 'youtube', name: 'YouTuber Estimator', icon: Youtube, desc: 'AI Earnings' },
           { id: 'freelance', name: 'Freelance Rate', icon: DollarSign, desc: 'Hourly Calc' },
         ];
       case 'life':
         return [
            { id: 'fire', name: 'FIRE Calculator', icon: Flame, desc: 'Retire Early' },
            { id: 'emergency', name: 'Emergency Fund', icon: ShieldCheck, desc: 'Safety Net' },
            { id: '100age', name: '100 - Age Rule', icon: HeartPulse, desc: 'Asset Allocation' },
         ];
       default: return [];
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-fade-in">
      
      {/* Sidebar / Topbar for Categories */}
      <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
         {TOOL_CATEGORIES.map(cat => (
           <button 
             key={cat.id} 
             onClick={() => setActiveCategory(cat.id)}
             className={`p-4 rounded-xl flex items-center gap-3 transition-all min-w-[140px] ${activeCategory === cat.id ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
           >
             <cat.icon size={20} />
             <span className="font-medium">{cat.label}</span>
           </button>
         ))}
         
         <div className="hidden lg:block mt-auto p-4 bg-slate-800/50 rounded-xl border border-white/5">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Flame size={16} className="text-orange-500"/> FIRE Goal</h4>
            <p className="text-xs text-slate-400 mb-2">To retire, you need 25x annual expenses.</p>
            <p className="text-lg font-mono text-emerald-400">{formatCurrency(fireCorpus)}</p>
         </div>

         {/* Launchpad Button */}
         <button 
           onClick={() => setShowGuide(true)}
           className="p-4 rounded-xl flex items-center gap-3 bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-all mt-2"
         >
           <Rocket size={20} />
           <span>Publish App</span>
         </button>
      </div>

      {/* Grid of Tools */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start overflow-y-auto pr-2">
         {getToolsByCategory().map(tool => (
            <button 
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] ${activeTool === tool.id ? 'bg-slate-700 border-white/30 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
            >
               <tool.icon size={24} className="mb-4 text-slate-200" />
               <h3 className="font-bold text-white mb-1">{tool.name}</h3>
               <p className="text-xs text-slate-400">{tool.desc}</p>
            </button>
         ))}
      </div>

      {/* Active Tool Panel */}
      <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-y-auto shadow-2xl">
         {activeTool ? renderToolContent() : (
           <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
               <School size={32} className="text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-white">Strategy Lab</h3>
             <p className="text-sm text-slate-400 px-8">Select a financial model to simulate your wealth journey.</p>
           </div>
         )}
      </div>

      {showGuide && <PublishingGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default Tools;

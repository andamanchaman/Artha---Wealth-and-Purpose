
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, ScanFace, UserPlus, LogIn, AlertCircle, Fingerprint, X, Landmark, Gavel, FileLock } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
  registeredUsers: UserProfile[];
  onRegister: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, registeredUsers, onRegister, onUpdateUser }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isScanning, setIsScanning] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicy, setShowPolicy] = useState<'terms' | 'privacy' | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regIncome, setRegIncome] = useState('');
  const [regGoal, setRegGoal] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Compliance Required: Please acknowledge the Private Wealth Protocol.");
      return;
    }
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    if (user) {
        onLogin(user);
    } else {
        setError("Invalid identity markers. Access denied.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Compliance Required: Please acknowledge the Private Wealth Protocol.");
      return;
    }
    if (registeredUsers.find(u => u.email === regEmail)) {
        setError("Strategic ID already in use.");
        return;
    }

    const newUser: UserProfile = {
        id: crypto.randomUUID(),
        name: regName,
        email: regEmail,
        password: regPass,
        monthlyIncome: parseFloat(regIncome),
        financialGoal: regGoal,
        targetAmount: 100000,
        currentSavings: 0,
        currencySymbol: '₹',
        savingsLevel: 'Novice',
        karmaScore: 50,
        bioAuthEnabled: false
    };
    onRegister(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
          
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black tracking-tighter mb-1">
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-white to-emerald-400">ARTHA</span>
            </h1>
            <p className="text-slate-500 tracking-[0.4em] text-[10px] font-bold uppercase">Strategic Terminal</p>
          </div>

          {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6 flex items-start gap-3 text-red-300 text-sm animate-fade-in">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
              </div>
          )}

          <div className="space-y-6">
            {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1 tracking-widest">Master Identity (Email)</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold-500 outline-none transition-all placeholder:text-slate-700" placeholder="vats@artha.com" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1 tracking-widest">Master Key</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold-500 outline-none transition-all" />
                    </div>
                    
                    {/* Compliance Check */}
                    <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                       <input 
                        type="checkbox" 
                        id="terms" 
                        checked={acceptedTerms} 
                        onChange={e => setAcceptedTerms(e.target.checked)} 
                        className="mt-1 accent-gold-500 h-4 w-4 rounded"
                       />
                       <label htmlFor="terms" className="text-[10px] text-slate-400 leading-relaxed font-medium">
                         I agree to the <button type="button" onClick={() => setShowPolicy('terms')} className="text-gold-400 hover:underline">Institutional Terms</button> and <button type="button" onClick={() => setShowPolicy('privacy')} className="text-emerald-400 hover:underline">Privacy Protocol</button>. <br/> Identity (Email/Name) is synced for terminal continuity. Sensitive financial data remains client-side encrypted.
                       </label>
                    </div>

                    <button type="submit" className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-gold-400 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm shadow-xl">
                        <LogIn size={18} /> Initialize Access
                    </button>
                </form>
            ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                        <input value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Full Name" className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all" />
                        <input type="number" value={regIncome} onChange={e => setRegIncome(e.target.value)} required placeholder="Income" className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="Master Email" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all" />
                    <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} required placeholder="Master Key" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all" />
                    <input value={regGoal} onChange={e => setRegGoal(e.target.value)} required placeholder="Wealth Mission" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all" />
                    
                    {/* Compliance Check */}
                    <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                       <input 
                        type="checkbox" 
                        id="regTerms" 
                        checked={acceptedTerms} 
                        onChange={e => setAcceptedTerms(e.target.checked)} 
                        className="mt-1 accent-emerald-500 h-4 w-4 rounded"
                       />
                       <label htmlFor="regTerms" className="text-[10px] text-slate-400 leading-relaxed font-medium">
                         I agree to the <button type="button" onClick={() => setShowPolicy('terms')} className="text-emerald-400 hover:underline">Institutional Terms</button> and <button type="button" onClick={() => setShowPolicy('privacy')} className="text-emerald-400 hover:underline">Privacy Protocol</button>. Identity is synchronized; sensitive wealth flow remains local and encrypted.
                       </label>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl mt-4 hover:bg-emerald-500 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm shadow-xl">
                        <UserPlus size={18} /> Create Deployment
                    </button>
                </form>
            )}

            <div className="mt-8 text-center">
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                    {mode === 'login' ? "New Strategist? Register" : "Existing Member? Login"}
                </button>
            </div>
          </div>
        </div>

        {/* Legal Modals */}
        {showPolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
             <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl overflow-y-auto max-h-[80vh]">
                <button onClick={() => setShowPolicy(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
                
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      {showPolicy === 'terms' ? <Gavel className="text-gold-400" /> : <FileLock className="text-emerald-400" />}
                   </div>
                   <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                     {showPolicy === 'terms' ? 'Institutional Terms' : 'Privacy Protocol'}
                   </h2>
                </div>

                <div className="prose prose-invert text-slate-400 text-sm leading-relaxed space-y-6">
                  {showPolicy === 'terms' ? (
                    <>
                      <p>Welcome to <strong>Artha Institutional</strong>. By accessing this terminal, you agree to the following framework:</p>
                      <h4 className="text-white font-bold">1. Advisory Disclaimer</h4>
                      <p>The guidance provided by "Acharya" and our strategic engines is for educational and strategic simulation purposes only. We are not a SEBI-registered advisory. Every financial deployment is at your own strategic risk.</p>
                      <h4 className="text-white font-bold">2. Digital Identity</h4>
                      <p>You are responsible for maintaining the security of your Master Key. Lost keys can lead to total asset visibility loss.</p>
                      <h4 className="text-white font-bold">3. Data Collection</h4>
                      <p>We synchronize your name and email to identify you across Artha terminals. Financial inputs like income are processed locally to ensure maximum privacy.</p>
                    </>
                  ) : (
                    <>
                      <p>At <strong>Artha</strong>, privacy is our highest strategic asset:</p>
                      <h4 className="text-white font-bold">1. Data Sovereignty</h4>
                      <p>Sensitive wealth markers (Income, Transactions) are kept exclusively within your local secure enclave. Identity data (Name, Email) is synced to our central strategic ledger for multi-device support.</p>
                      <h4 className="text-white font-bold">2. Biometric Integrity</h4>
                      <p>Passkeys and biometric data are handled by your hardware. We never receive or store your actual physical biometric markers.</p>
                      <h4 className="text-white font-bold">3. Zero-Sale Policy</h4>
                      <p>We do not trade strategist data. Your wealth path is yours alone.</p>
                    </>
                  )}
                </div>

                <div className="mt-10">
                   <button onClick={() => setShowPolicy(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                      Acknowledged
                   </button>
                </div>
             </div>
          </div>
        )}
    </div>
  );
};

export default Auth;

import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, ScanFace, UserPlus, LogIn, Camera, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
  registeredUsers: UserProfile[];
  onRegister: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, registeredUsers, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [useFaceId, setUseFaceId] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regIncome, setRegIncome] = useState('');
  const [regGoal, setRegGoal] = useState('');

  const startCamera = async () => {
    try {
      setUseFaceId(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
      
      // Simulate scan success after 2 seconds
      setTimeout(() => {
        setIsScanning(false);
        stopCamera(stream);
        
        // Mock Login first available user or create dummy
        if (registeredUsers.length > 0) {
            onLogin(registeredUsers[0]);
        } else {
            setError("No users registered for Face ID. Please register first.");
            setUseFaceId(false);
        }
      }, 2500);

    } catch (err) {
      setError("Camera access denied or unavailable.");
      setUseFaceId(false);
    }
  };

  const stopCamera = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    if (user) {
        onLogin(user);
    } else {
        setError("Invalid credentials. Try 'admin@artha.com' / 'password'");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registeredUsers.find(u => u.email === regEmail)) {
        setError("User already exists.");
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
        bioAuthEnabled: true
    };
    onRegister(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1620714223084-874165487a4a?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        
        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-emerald-400 mb-2">ARTHA</h1>
            <p className="text-slate-300 tracking-widest text-xs uppercase">Wealth & Strategy</p>
          </div>

          {error && (
              <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl mb-4 flex items-center gap-2 text-red-200 text-sm">
                  <AlertCircle size={16} /> {error}
              </div>
          )}

          {useFaceId ? (
              <div className="text-center space-y-4">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gold-500 shadow-2xl shadow-gold-500/20">
                      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover"></video>
                      {isScanning && (
                          <div className="absolute inset-0 bg-emerald-500/20 animate-pulse border-b-4 border-emerald-400"></div>
                      )}
                  </div>
                  <p className="text-emerald-400 animate-pulse font-mono">
                      {isScanning ? "SCANNING BIOMETRICS..." : "AUTHENTICATED"}
                  </p>
              </div>
          ) : (
             <>
                {mode === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-xs uppercase text-slate-400 font-bold ml-1">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none" placeholder="admin@artha.com" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-slate-400 font-bold ml-1">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none" placeholder="password" />
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all flex justify-center items-center gap-2">
                                <LogIn size={18} /> Login
                            </button>
                            <button type="button" onClick={startCamera} className="bg-slate-800 border border-slate-600 text-white p-3 rounded-xl hover:bg-slate-700">
                                <ScanFace size={24} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <input value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Name" className="bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                            <input type="number" value={regIncome} onChange={e => setRegIncome(e.target.value)} required placeholder="Income" className="bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        </div>
                        <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="Email" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} required placeholder="Password" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        <input value={regGoal} onChange={e => setRegGoal(e.target.value)} required placeholder="Goal (e.g. House)" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        
                        <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl mt-2 hover:shadow-lg transition-all flex justify-center items-center gap-2">
                            <UserPlus size={18} /> Create Account
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-gold-400 hover:text-gold-300 text-sm font-medium underline-offset-4 hover:underline">
                        {mode === 'login' ? "New here? Create Profile" : "Already have an account? Login"}
                    </button>
                </div>
             </>
          )}
        </div>
    </div>
  );
};

export default Auth;
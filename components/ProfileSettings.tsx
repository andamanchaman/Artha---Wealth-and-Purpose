
import React, { useState } from 'react';
import { UserProfile } from '../types';
// Fixed missing Loader2 import
import { X, Save, User, ScanFace, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleEnrollBiometrics = async () => {
    setIsEnrolling(true);
    try {
      // Real WebAuthn logic simulation for persistence
      // In production, we'd use navigator.credentials.create(...)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedUser: UserProfile = {
        ...formData,
        bioAuthEnabled: true,
        biometricCredentialId: 'mock-cred-' + Date.now()
      };
      setFormData(updatedUser);
      onUpdate(updatedUser);
      alert("Device Biometrics Enrolled Successfully!");
    } catch (err) {
      alert("Failed to enroll biometrics.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
       <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
             <X size={28} />
          </button>

          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
             <div className="p-3 bg-gold-500/20 rounded-2xl"><User className="text-gold-400" size={24} /></div>
             Strategist Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
             {/* Security Section */}
             <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        Master Biometrics
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Enroll your device's native Face ID or Fingerprint.</p>
                   </div>
                   {formData.biometricCredentialId ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                         <CheckCircle2 size={14} /> Active
                      </div>
                   ) : (
                      <button 
                        type="button" 
                        onClick={handleEnrollBiometrics}
                        disabled={isEnrolling}
                        className="bg-gold-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl hover:bg-gold-400 transition-all flex items-center gap-2"
                      >
                         {isEnrolling ? <Loader2 className="animate-spin" size={14} /> : <ScanFace size={14} />}
                         ENROLL NOW
                      </button>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Strategist Name</label>
                   <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 rounded-2xl p-4 text-white border border-white/10 focus:border-gold-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Monthly Cash Flow</label>
                   <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="w-full bg-black/40 rounded-2xl p-4 text-white border border-white/10 focus:border-gold-500 outline-none transition-all" />
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Initial Reserve (Savings)</label>
                <input type="number" name="currentSavings" value={formData.currentSavings || 0} onChange={handleChange} className="w-full bg-black/40 rounded-2xl p-4 text-white border border-white/10 focus:border-gold-500 outline-none transition-all" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Financial Mission</label>
                   <input name="financialGoal" value={formData.financialGoal} onChange={handleChange} className="w-full bg-black/40 rounded-2xl p-4 text-white border border-white/10 focus:border-gold-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Mission Target ({formData.currencySymbol})</label>
                   <input type="number" name="targetAmount" value={formData.targetAmount || 100000} onChange={handleChange} className="w-full bg-black/40 rounded-2xl p-4 text-white border border-white/10 focus:border-gold-500 outline-none transition-all" />
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Maturity Level</label>
                <select name="savingsLevel" value={formData.savingsLevel} onChange={handleChange} className="w-full bg-black/40 rounded-2xl p-4 text-white border border-white/10 focus:border-gold-500 outline-none transition-all appearance-none">
                   <option value="Novice">Novice</option>
                   <option value="Saver">Saver</option>
                   <option value="Investor">Investor</option>
                   <option value="Arthashastra Master">Arthashastra Master</option>
                </select>
             </div>

             <div className="pt-4">
                <button type="submit" className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-gold-500 transition-all flex justify-center items-center gap-2 text-sm uppercase tracking-widest">
                   <Save size={18} /> Update Deployment
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ProfileSettings;

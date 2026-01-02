import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Save, User } from 'lucide-react';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
       <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 relative animate-fade-in">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
             <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
             <User className="text-gold-500" /> Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold">Name</label>
                   <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800 rounded-lg p-3 text-white border border-slate-700 focus:border-gold-500 outline-none mt-1" />
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold">Income</label>
                   <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="w-full bg-slate-800 rounded-lg p-3 text-white border border-slate-700 focus:border-gold-500 outline-none mt-1" />
                </div>
             </div>

             <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Current Savings / Opening Balance</label>
                <input type="number" name="currentSavings" value={formData.currentSavings || 0} onChange={handleChange} className="w-full bg-slate-800 rounded-lg p-3 text-white border border-slate-700 focus:border-gold-500 outline-none mt-1" placeholder="Initial amount before tracking" />
             </div>
             
             <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Email (ID)</label>
                <input name="email" value={formData.email || ''} disabled className="w-full bg-slate-800/50 rounded-lg p-3 text-slate-400 border border-slate-700 mt-1 cursor-not-allowed" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold">Financial Goal</label>
                   <input name="financialGoal" value={formData.financialGoal} onChange={handleChange} className="w-full bg-slate-800 rounded-lg p-3 text-white border border-slate-700 focus:border-gold-500 outline-none mt-1" />
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold">Goal Target ({formData.currencySymbol})</label>
                   <input type="number" name="targetAmount" value={formData.targetAmount || 100000} onChange={handleChange} className="w-full bg-slate-800 rounded-lg p-3 text-white border border-slate-700 focus:border-gold-500 outline-none mt-1" />
                </div>
             </div>

             <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Savings Level</label>
                <select name="savingsLevel" value={formData.savingsLevel} onChange={handleChange} className="w-full bg-slate-800 rounded-lg p-3 text-white border border-slate-700 focus:border-gold-500 outline-none mt-1">
                   <option value="Novice">Novice</option>
                   <option value="Saver">Saver</option>
                   <option value="Investor">Investor</option>
                   <option value="Arthashastra Master">Arthashastra Master</option>
                </select>
             </div>

             <div className="pt-4">
                <button type="submit" className="w-full bg-gradient-to-r from-gold-500 to-emerald-600 text-slate-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all flex justify-center items-center gap-2">
                   <Save size={18} /> Save Changes
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ProfileSettings;
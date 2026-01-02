
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  LayoutDashboard, 
  WalletCards, 
  BrainCircuit, 
  Sparkles, 
  LogOut, 
  Menu,
  X,
  Edit3,
  FlaskConical,
  RotateCcw
} from 'lucide-react';

interface LayoutProps {
  user: UserProfile;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, activeTab, setActiveTab, onLogout, onEditProfile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger & Udhaar', icon: WalletCards },
    { id: 'tools', label: 'Strategy Lab', icon: FlaskConical },
    { id: 'simulator', label: 'Purchase Simulator', icon: BrainCircuit },
    { id: 'ai-hub', label: 'Chanakya AI', icon: Sparkles },
  ];

  const handleRestore = () => {
    if(confirm("Restore to last saved checkpoint? Any unsaved changes since last refresh will be lost.")) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans text-slate-100 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-6 bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-2xl font-black tracking-tighter">
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-white to-emerald-400">ARTHA</span>
        </h1>
        <div className="flex items-center gap-4">
           <button onClick={handleRestore} className="p-2 text-white/40 hover:text-white transition-colors">
              <RotateCcw size={20} />
           </button>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/80">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full w-72 
        bg-slate-950/80 backdrop-blur-2xl border-r border-white/10
        transform transition-transform duration-300 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black tracking-tighter">
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-white to-emerald-400">ARTHA</span>
              </h1>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] mt-2">Private Wealth</p>
            </div>
            <button 
              onClick={handleRestore} 
              title="Restore Checkpoint"
              className="p-1.5 text-slate-600 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-5 mb-6 border-b border-white/5 bg-white/5 mx-6 rounded-[2rem] group relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate text-sm">{user.name}</p>
              <p className="text-[10px] text-gold-400 uppercase font-bold tracking-widest truncate">{user.savingsLevel}</p>
            </div>
          </div>
          <button 
             onClick={onEditProfile}
             className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white opacity-0 md:group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded-xl"
          >
             <Edit3 size={14} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-white/10 border border-white/10 text-white shadow-2xl' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-gold-400' : ''} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-[1.5rem] transition-colors"
          >
            <LogOut size={22} />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth p-6 md:p-12">
        <div className="max-w-6xl mx-auto pb-24 md:pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

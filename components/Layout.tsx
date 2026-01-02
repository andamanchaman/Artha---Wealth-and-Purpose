
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
      <div className="md:hidden flex justify-between items-center p-4 bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-emerald-400">
          ARTHA
        </h1>
        <div className="flex items-center gap-2">
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
        fixed md:relative top-0 left-0 h-full w-64 
        bg-slate-900/60 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 hidden md:block">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-emerald-400">
                ARTHA
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Wealth & Purpose</p>
            </div>
            <button 
              onClick={handleRestore} 
              title="Restore Checkpoint"
              className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-4 mb-4 border-b border-white/5 bg-white/5 mx-4 rounded-xl group relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-gold-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-gold-400 truncate">{user.savingsLevel}</p>
            </div>
          </div>
          <button 
             onClick={onEditProfile}
             className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white opacity-0 md:group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded"
          >
             <Edit3 size={12} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-emerald-900/80 to-slate-800/80 border border-emerald-500/30 text-emerald-100 shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-gold-400' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth p-4 md:p-8">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gold-600/10 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="max-w-5xl mx-auto pb-24 md:pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

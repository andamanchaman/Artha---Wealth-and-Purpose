
import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, AppState } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Simulator from './components/Simulator';
import AiHub from './components/AiHub';
import Tools from './components/Tools';
import Auth from './components/Auth';
import Landing from './components/Landing';
import ProfileSettings from './components/ProfileSettings';

const INITIAL_STATE: AppState = {
  user: null,
  transactions: [],
  registeredUsers: [] 
};

const STORAGE_KEY = 'artha_app_data_v3';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setState(parsed);
      // If user is already logged in, we skip the landing page
      if (parsed.user) {
        setShowLanding(false);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  const handleLogin = (user: UserProfile) => {
    setState(prev => ({ ...prev, user }));
    setShowLanding(false);
  };

  const handleRegister = (newUser: UserProfile) => {
    setState(prev => ({
        ...prev,
        registeredUsers: [...prev.registeredUsers, newUser]
    }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
    setShowLanding(true);
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
     setState(prev => ({
        ...prev,
        user: updatedUser,
        registeredUsers: prev.registeredUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
     }));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT: Transaction = { ...t, id: crypto.randomUUID() };
    
    let karmaChange = 0;
    if (t.type === 'INCOME') karmaChange = 2;
    if (t.type === 'EXPENSE' && t.category === 'Education') karmaChange = 1;
    if (t.type === 'EXPENSE' && t.category === 'Entertainment') karmaChange = -1;

    setState(prev => {
        const newUser = prev.user ? {
            ...prev.user,
            karmaScore: Math.min(100, Math.max(0, prev.user.karmaScore + karmaChange))
        } : null;

        return { 
            ...prev, 
            transactions: [newT, ...prev.transactions],
            user: newUser
        };
    });
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const settleUdhaar = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === id ? { ...t, isSettled: true } : t
      )
    }));
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-gold-500 font-bold tracking-widest uppercase">
    <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    Artha Initializing...
  </div>;

  // 1. Show Landing First
  if (showLanding && !state.user) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  // 2. Authentication View (if not logged in)
  if (!state.user) {
    return (
        <Auth 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            registeredUsers={state.registeredUsers} 
            onUpdateUser={handleUpdateProfile}
        />
    );
  }

  // 3. Main Application
  return (
    <Layout 
      user={state.user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      onEditProfile={() => setShowProfileEdit(true)}
    >
      {activeTab === 'dashboard' && <Dashboard user={state.user} transactions={state.transactions} />}
      {activeTab === 'transactions' && (
        <Transactions 
          transactions={state.transactions} 
          onAddTransaction={addTransaction}
          onDeleteTransaction={deleteTransaction}
          onSettleUdhaar={settleUdhaar}
        />
      )}
      {activeTab === 'simulator' && <Simulator user={state.user} />}
      {activeTab === 'ai-hub' && <AiHub onAddTransaction={addTransaction} />}
      {activeTab === 'tools' && <Tools user={state.user} />}

      {showProfileEdit && state.user && (
          <ProfileSettings 
            user={state.user} 
            onClose={() => setShowProfileEdit(false)} 
            onUpdate={handleUpdateProfile} 
          />
      )}
    </Layout>
  );
};

export default App;

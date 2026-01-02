import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Plus, Check, Trash2, ArrowRight, Calendar } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onSettleUdhaar: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, onAddTransaction, onDeleteTransaction, onSettleUdhaar }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'udhaar'>('all');
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [relatedTo, setRelatedTo] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;

    onAddTransaction({
      amount: parseFloat(amount),
      description: desc,
      type,
      category: type === TransactionType.EXPENSE ? category : 'Income',
      date: new Date(date).toISOString(),
      relatedPerson: (type === TransactionType.LENT || type === TransactionType.BORROWED) ? relatedTo : undefined,
      isSettled: false
    });

    // Reset
    setAmount('');
    setDesc('');
    setRelatedTo('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  const udhaarList = transactions.filter(t => (t.type === TransactionType.LENT || t.type === TransactionType.BORROWED) && !t.isSettled);
  const historyList = transactions.filter(t => t.isSettled || (t.type !== TransactionType.LENT && t.type !== TransactionType.BORROWED));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 bg-slate-800/50 p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('all')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Ledger
           </button>
           <button 
             onClick={() => setActiveTab('udhaar')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'udhaar' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Udhaar Tracker
           </button>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all"
        >
          <Plus size={18} />
          <span>Add New</span>
        </button>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-800/60 border border-white/10 backdrop-blur-xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase">Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-gold-500 focus:outline-none"
              >
                <option value={TransactionType.EXPENSE}>Expense</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.LENT}>Lent (Given)</option>
                <option value={TransactionType.BORROWED}>Borrowed (Taken)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase">Amount</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-gold-500 focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 uppercase">Description</label>
              <input 
                type="text" 
                value={desc} 
                onChange={e => setDesc(e.target.value)}
                placeholder="What was this for?"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-gold-500 focus:outline-none"
                required
              />
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 uppercase">Date</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-gold-500 focus:outline-none"
                />
            </div>

            {type === TransactionType.EXPENSE && (
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 uppercase">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Health'].map(c => (
                    <button 
                      key={c} 
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1 rounded-full text-xs border ${category === c ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-transparent border-slate-700 text-slate-400'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(type === TransactionType.LENT || type === TransactionType.BORROWED) && (
              <div className="md:col-span-2">
                 <label className="block text-xs text-slate-400 mb-1 uppercase">Person Name</label>
                 <input 
                  type="text" 
                  value={relatedTo} 
                  onChange={e => setRelatedTo(e.target.value)}
                  placeholder="Who?"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors">
            Confirm Transaction
          </button>
        </form>
      )}

      {/* Lists */}
      <div className="space-y-3">
        {(activeTab === 'all' ? historyList : udhaarList).length === 0 && (
           <div className="text-center py-10 text-slate-500 italic">
             No records found in the sacred scrolls.
           </div>
        )}

        {(activeTab === 'all' ? historyList : udhaarList).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
            const isFuture = new Date(t.date) > new Date();
            return (
          <div key={t.id} className={`group relative p-4 rounded-xl border transition-all flex items-center justify-between ${isFuture ? 'bg-blue-900/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
            
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl
                ${t.type === TransactionType.EXPENSE ? 'bg-red-500/20 text-red-400' : 
                  t.type === TransactionType.INCOME ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-blue-500/20 text-blue-400'}
              `}>
                {t.type === TransactionType.EXPENSE ? '📉' : t.type === TransactionType.INCOME ? '📈' : '🤝'}
              </div>
              <div>
                <h4 className="font-medium text-slate-200">
                    {t.description} 
                    {isFuture && <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Upcoming</span>}
                </h4>
                <p className="text-xs text-slate-500">
                  {new Date(t.date).toLocaleDateString()} • {t.type} {t.relatedPerson && `• ${t.relatedPerson}`}
                </p>
              </div>
            </div>

            <div className="text-right flex items-center gap-4">
              <p className={`font-bold font-mono ${
                t.type === TransactionType.EXPENSE || t.type === TransactionType.LENT ? 'text-red-300' : 'text-emerald-300'
              }`}>
                {t.type === TransactionType.EXPENSE || t.type === TransactionType.LENT ? '-' : '+'}
                ₹{t.amount}
              </p>
              
              {activeTab === 'udhaar' && !t.isSettled && (
                <button 
                  onClick={() => onSettleUdhaar(t.id)}
                  title="Mark Settled"
                  className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  <Check size={16} />
                </button>
              )}
              
              <button 
                onClick={() => onDeleteTransaction(t.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Transactions;
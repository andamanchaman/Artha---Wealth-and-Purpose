export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  LENT = 'LENT', // Udhaar given
  BORROWED = 'BORROWED' // Udhaar taken
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string; // ISO string
  relatedPerson?: string; // For Udhaar
  isSettled?: boolean; // For Udhaar
}

export interface UserProfile {
  id: string; // Unique ID for auth
  name: string;
  email?: string;
  password?: string; // In real app, hash this. Here simulated.
  monthlyIncome: number; 
  financialGoal: string;
  targetAmount: number; // For Goal Tracker
  currentSavings: number; // Manually updated or calculated
  currencySymbol: string;
  savingsLevel: 'Novice' | 'Saver' | 'Investor' | 'Arthashastra Master';
  karmaScore: number; // 0-100 Financial Health Score
  bioAuthEnabled: boolean; // Face ID preference
}

export interface AppState {
  user: UserProfile | null;
  transactions: Transaction[];
  registeredUsers: UserProfile[]; // Simulating a DB of users
}

export interface BillAnalysis {
  merchant: string;
  total: number;
  date: string;
  items: { name: string; price: number }[];
  category: string;
}

export interface PurchaseImpact {
  healthScore: number; // 0-100 (100 is healthy)
  socialScore: number; // 0-100 (100 is good for relationships)
  utilityScore: number; // 0-100 (Practicality)
  sustainabilityScore: number; // 0-100 (Eco-friendly)
  verdict: string;
  alternativeSuggestion: string; // "Instead of this, buy..."
}

export interface GeminiChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
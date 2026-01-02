
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  LENT = 'LENT', 
  BORROWED = 'BORROWED' 
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string; 
  relatedPerson?: string; 
  isSettled?: boolean; 
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  monthlyIncome: number; 
  financialGoal: string;
  targetAmount: number; 
  currentSavings: number; 
  currencySymbol: string;
  savingsLevel: 'Novice' | 'Saver' | 'Investor' | 'Arthashastra Master';
  karmaScore: number; 
  bioAuthEnabled: boolean;
  biometricCredentialId?: string; // For WebAuthn Passkeys
}

export interface AppState {
  user: UserProfile | null;
  transactions: Transaction[];
  registeredUsers: UserProfile[]; 
}

export interface BillAnalysis {
  merchant: string;
  total: number;
  date: string;
  items: { name: string; price: number }[];
  category: string;
}

export interface PurchaseImpact {
  healthScore: number; 
  socialScore: number; 
  utilityScore: number; 
  sustainabilityScore: number; 
  verdict: string;
  alternativeSuggestion: string; 
}

export interface GeminiChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

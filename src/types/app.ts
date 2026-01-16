export interface Wallet {
  id: string;
  name: string;
  balance: number;
  isActive: boolean;
  createdAt: number;
}
export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'expense' | 'deposit';
  categoryId: string;
  date: number;
  notes?: string;
  createdAt: number;
}
export interface Category {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean; // Cannot be deleted if true
}
export interface AppData {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  lastUpdated: number;
}
// Backend Entity State
export interface UserEntityState {
  id: string;
  data: AppData;
}
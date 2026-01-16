export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// --- Muhafiz App Types ---
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
  customCategoryName?: string; // New field for one-time or custom categories
  date: number;
  notes?: string;
  createdAt: number;
  // Transfer Support
  relatedTransactionId?: string; // Links expense in Wallet A to deposit in Wallet B
  isTransfer?: boolean;
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
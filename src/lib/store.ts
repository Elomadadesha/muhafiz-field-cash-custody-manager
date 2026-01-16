import { create } from 'zustand';
import { AppData, Wallet, Transaction, Category } from '@/types/app';
import { api } from '@/lib/api-client';
interface AppState {
  // Auth
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  // Data
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  // UI State
  isTransactionDrawerOpen: boolean;
  selectedWalletId: string | null;
  // Actions
  sync: () => Promise<void>;
  addWallet: (name: string, initialBalance: number) => Promise<void>;
  toggleWalletStatus: (id: string) => Promise<void>;
  // Transaction Actions
  openTransactionDrawer: (walletId?: string) => void;
  closeTransactionDrawer: () => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  // Helpers
  getWallet: (id: string) => Wallet | undefined;
}
// Initial Mock Data for first load or offline fallback
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'مواصلات', isSystem: true },
  { id: 'cat_2', name: 'وقود', isSystem: true },
  { id: 'cat_3', name: 'صيانة', isSystem: true },
  { id: 'cat_4', name: 'قطع غيار', isSystem: true },
  { id: 'cat_5', name: 'إعاشة', isSystem: true },
  { id: 'cat_6', name: 'أخرى', isSystem: true },
];
export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: localStorage.getItem('muhafiz_auth') === 'true',
  wallets: [],
  transactions: [],
  categories: INITIAL_CATEGORIES,
  isLoading: false,
  error: null,
  isTransactionDrawerOpen: false,
  selectedWalletId: null,
  login: async (password: string) => {
    // Simple mock auth for Phase 1
    // In a real app, verify against backend hash
    if (password === '123456') { // Demo password
      localStorage.setItem('muhafiz_auth', 'true');
      set({ isAuthenticated: true });
      await get().sync();
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('muhafiz_auth');
    set({ isAuthenticated: false, wallets: [], transactions: [] });
  },
  sync: async () => {
    set({ isLoading: true, error: null });
    try {
      // We use a fixed ID for the single user concept
      const data = await api<AppData>('/api/sync');
      set({
        wallets: data.wallets || [],
        transactions: data.transactions || [],
        categories: data.categories?.length ? data.categories : INITIAL_CATEGORIES,
        isLoading: false
      });
    } catch (err) {
      console.error('Sync failed:', err);
      set({
        error: err instanceof Error ? err.message : 'فشل الاتصال بالخادم',
        isLoading: false
      });
    }
  },
  addWallet: async (name: string, initialBalance: number) => {
    set({ isLoading: true });
    try {
      const newWallet: Wallet = {
        id: crypto.randomUUID(),
        name,
        balance: initialBalance,
        isActive: true,
        createdAt: Date.now(),
      };
      // Optimistic update
      set(state => ({
        wallets: [...state.wallets, newWallet]
      }));
      await api('/api/wallet', {
        method: 'POST',
        body: JSON.stringify(newWallet)
      });
      set({ isLoading: false });
    } catch (err) {
      console.error('Add wallet failed:', err);
      // Revert on failure would go here in a robust app
      set({ isLoading: false, error: 'فشل إضافة المحفظة' });
    }
  },
  toggleWalletStatus: async (id: string) => {
    const wallets = get().wallets;
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) return;
    const updatedWallet = { ...wallet, isActive: !wallet.isActive };
    set(state => ({
      wallets: state.wallets.map(w => w.id === id ? updatedWallet : w)
    }));
    try {
      await api('/api/wallet', {
        method: 'POST',
        body: JSON.stringify(updatedWallet)
      });
    } catch (err) {
      console.error('Update wallet failed:', err);
      // Revert
      set(state => ({
        wallets: state.wallets.map(w => w.id === id ? wallet : w)
      }));
    }
  },
  openTransactionDrawer: (walletId) => {
    set({ isTransactionDrawerOpen: true, selectedWalletId: walletId || null });
  },
  closeTransactionDrawer: () => {
    set({ isTransactionDrawerOpen: false, selectedWalletId: null });
  },
  addTransaction: async (data) => {
    set({ isLoading: true });
    try {
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...data
      };
      // Optimistic update logic is complex due to balance updates.
      // For safety, we'll rely on the server response which returns the full updated AppData.
      // But to make UI snappy, we can try to append locally first if we want.
      // Let's stick to server response for data integrity in this phase.
      const updatedData = await api<AppData>('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(newTx)
      });
      set({
        wallets: updatedData.wallets,
        transactions: updatedData.transactions,
        isLoading: false,
        isTransactionDrawerOpen: false, // Close drawer on success
        selectedWalletId: null
      });
    } catch (err) {
      console.error('Add transaction failed:', err);
      set({ isLoading: false, error: 'فشل إضافة العملية' });
      throw err; // Re-throw to let UI handle specific error feedback if needed
    }
  },
  getWallet: (id) => {
    return get().wallets.find(w => w.id === id);
  }
}));
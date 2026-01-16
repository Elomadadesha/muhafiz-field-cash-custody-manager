import { create } from 'zustand';
import { AppData, Wallet, Transaction, Category } from '@/types/app';
import { db, AppSettings } from '@/lib/db';
import { hashPassword } from '@/lib/security';
import { v4 as uuidv4 } from 'uuid';
interface AppState {
  // Auth State
  isAuthenticated: boolean;
  isLocked: boolean;
  isSetup: boolean; // True if password exists
  isLoading: boolean;
  error: string | null;
  // Data State
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  // UI State
  isTransactionDrawerOpen: boolean;
  selectedWalletId: string | null;
  // Initialization
  init: () => Promise<void>;
  // Auth Actions
  setupApp: (password: string) => Promise<void>;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  lockApp: () => void;
  unlockApp: (password: string) => Promise<boolean>;
  // Data Actions
  addWallet: (name: string, initialBalance: number) => Promise<void>;
  toggleWalletStatus: (id: string) => Promise<void>;
  // Transaction Actions
  openTransactionDrawer: (walletId?: string) => void;
  closeTransactionDrawer: () => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  // Category Actions
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  restoreData: (data: AppData) => Promise<void>;
  // Helpers
  getWallet: (id: string) => Wallet | undefined;
}
export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isLocked: false,
  isSetup: false,
  isLoading: true,
  error: null,
  wallets: [],
  transactions: [],
  categories: [],
  settings: { autoLockMinutes: 5, lastActive: Date.now(), currency: 'EGP' },
  isTransactionDrawerOpen: false,
  selectedWalletId: null,
  init: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if password exists
      const hash = await db.getPasswordHash();
      const isSetup = !!hash;
      // Load data
      const data = await db.getData();
      const settings = await db.getSettings();
      set({
        isSetup,
        wallets: data.wallets || [],
        transactions: data.transactions || [],
        categories: data.categories || [],
        settings: settings || { autoLockMinutes: 5, lastActive: Date.now(), currency: 'EGP' },
        isLoading: false
      });
    } catch (err) {
      console.error('Init failed:', err);
      // Fallback to safe empty state to prevent app crash
      set({
        isLoading: false,
        error: 'فشل تحم��ل البيانات. يرجى تحديث الصفحة.',
        wallets: [],
        transactions: [],
        categories: [],
        settings: { autoLockMinutes: 5, lastActive: Date.now(), currency: 'EGP' }
      });
    }
  },
  setupApp: async (password: string) => {
    set({ isLoading: true });
    try {
      const hash = await hashPassword(password);
      await db.setPasswordHash(hash);
      set({ isSetup: true, isAuthenticated: true, isLocked: false, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: 'فشل إعداد الت��بيق' });
      throw err;
    }
  },
  login: async (password: string) => {
    set({ isLoading: true });
    try {
      const storedHash = await db.getPasswordHash();
      const inputHash = await hashPassword(password);
      if (storedHash === inputHash) {
        set({ isAuthenticated: true, isLocked: false, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err) {
      set({ isLoading: false });
      return false;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, isLocked: false });
  },
  lockApp: () => {
    set({ isLocked: true });
  },
  unlockApp: async (password: string) => {
    return get().login(password);
  },
  addWallet: async (name: string, initialBalance: number) => {
    set({ isLoading: true });
    try {
      const newWallet: Wallet = {
        id: uuidv4(),
        name,
        balance: initialBalance,
        isActive: true,
        createdAt: Date.now(),
      };
      const state = get();
      const newWallets = [...state.wallets, newWallet];
      // Update local state
      set({ wallets: newWallets });
      // Persist
      await db.saveData({
        wallets: newWallets,
        transactions: state.transactions,
        categories: state.categories,
        lastUpdated: Date.now()
      });
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: 'فشل إضافة المحفظة' });
    }
  },
  toggleWalletStatus: async (id: string) => {
    const state = get();
    const updatedWallets = state.wallets.map(w =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    set({ wallets: updatedWallets });
    await db.saveData({
      wallets: updatedWallets,
      transactions: state.transactions,
      categories: state.categories,
      lastUpdated: Date.now()
    });
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
        id: uuidv4(),
        createdAt: Date.now(),
        ...data
      };
      const state = get();
      // Update wallet balance
      const updatedWallets = state.wallets.map(w => {
        if (w.id === data.walletId) {
          const newBalance = data.type === 'expense'
            ? w.balance - data.amount
            : w.balance + data.amount;
          return { ...w, balance: newBalance };
        }
        return w;
      });
      const newTransactions = [newTx, ...state.transactions];
      set({
        wallets: updatedWallets,
        transactions: newTransactions,
        isLoading: false,
        isTransactionDrawerOpen: false,
        selectedWalletId: null
      });
      await db.saveData({
        wallets: updatedWallets,
        transactions: newTransactions,
        categories: state.categories,
        lastUpdated: Date.now()
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل إضافة العملية' });
    }
  },
  addCategory: async (name: string) => {
    set({ isLoading: true });
    try {
      const newCategory: Category = {
        id: uuidv4(),
        name,
        isSystem: false
      };
      const state = get();
      const newCategories = [...state.categories, newCategory];
      set({ categories: newCategories, isLoading: false });
      await db.saveData({
        wallets: state.wallets,
        transactions: state.transactions,
        categories: newCategories,
        lastUpdated: Date.now()
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل إضافة البند' });
    }
  },
  deleteCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      const state = get();
      const category = state.categories.find(c => c.id === id);
      if (category?.isSystem) {
        throw new Error("Cannot delete system category");
      }
      const newCategories = state.categories.filter(c => c.id !== id);
      set({ categories: newCategories, isLoading: false });
      await db.saveData({
        wallets: state.wallets,
        transactions: state.transactions,
        categories: newCategories,
        lastUpdated: Date.now()
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل حذف البند' });
    }
  },
  updateSettings: async (newSettings) => {
    const state = get();
    const updated = { ...state.settings, ...newSettings };
    set({ settings: updated });
    await db.saveSettings(updated);
  },
  restoreData: async (data: AppData) => {
    set({ isLoading: true });
    try {
      // Validate data structure roughly
      if (!Array.isArray(data.wallets) || !Array.isArray(data.transactions)) {
        throw new Error("Invalid data format");
      }
      set({
        wallets: data.wallets,
        transactions: data.transactions,
        categories: data.categories,
        isLoading: false
      });
      await db.saveData(data);
    } catch (err) {
      set({ isLoading: false, error: 'فشل استعادة البيانات' });
      throw err;
    }
  },
  getWallet: (id) => {
    return get().wallets.find(w => w.id === id);
  }
}));
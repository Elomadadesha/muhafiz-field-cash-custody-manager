import { create } from 'zustand';
import { AppData, Wallet, Transaction, Category } from '@/types/app';
import { db, AppSettings } from '@/lib/db';
import { hashPassword } from '@/lib/security';
import { v4 as uuidv4 } from 'uuid';
export type DrawerMode = 'create' | 'edit' | 'duplicate';
interface AppState {
  // Auth State
  isAuthenticated: boolean;
  isLocked: boolean;
  isSetup: boolean; // True if password exists
  isLoading: boolean;
  error: string | null;
  failedAttempts: number;
  lockoutUntil: number | null;
  // Data State
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  // UI State
  isTransactionDrawerOpen: boolean;
  drawerMode: DrawerMode;
  selectedWalletId: string | null;
  transactionIdToEdit: string | null;
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
  renameWallet: (id: string, newName: string) => Promise<void>;
  toggleWalletStatus: (id: string) => Promise<void>;
  // Transaction Actions
  openTransactionDrawer: (walletId?: string, transactionId?: string, mode?: DrawerMode) => void;
  closeTransactionDrawer: () => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  editTransaction: (id: string, data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  transferFunds: (fromWalletId: string, toWalletId: string, amount: number, date: number, notes?: string) => Promise<void>;
  // Category Actions
  addCategory: (name: string) => Promise<string | undefined>; // Returns the new ID
  updateCategory: (id: string, newName: string) => Promise<void>;
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
  failedAttempts: 0,
  lockoutUntil: localStorage.getItem('muhafiz_lockout') ? parseInt(localStorage.getItem('muhafiz_lockout')!) : null,
  wallets: [],
  transactions: [],
  categories: [],
  settings: { autoLockMinutes: 5, lastActive: Date.now(), currency: 'EGP' },
  isTransactionDrawerOpen: false,
  drawerMode: 'create',
  selectedWalletId: null,
  transactionIdToEdit: null,
  init: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if password exists
      const hash = await db.getPasswordHash();
      const isSetup = !!hash;
      // Load data
      const data = await db.getData();
      const settings = await db.getSettings();
      // Check lockout expiration on init
      const storedLockout = localStorage.getItem('muhafiz_lockout');
      let currentLockout = storedLockout ? parseInt(storedLockout) : null;
      if (currentLockout && Date.now() >= currentLockout) {
        currentLockout = null;
        localStorage.removeItem('muhafiz_lockout');
      }
      set({
        isSetup,
        wallets: data.wallets || [],
        transactions: data.transactions || [],
        categories: data.categories || [],
        settings: settings || { autoLockMinutes: 5, lastActive: Date.now(), currency: 'EGP' },
        lockoutUntil: currentLockout,
        isLoading: false
      });
    } catch (err) {
      console.error('Init failed:', err);
      // Fallback to safe empty state to prevent app crash
      set({
        isLoading: false,
        error: 'فشل تحميل البيانات. يرجى تحديث الصفحة.',
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
      set({ isLoading: false, error: 'فشل إعداد التطبيق' });
      throw err;
    }
  },
  login: async (password: string) => {
    const state = get();
    // Check lockout
    if (state.lockoutUntil) {
      if (Date.now() < state.lockoutUntil) {
        return false;
      } else {
        // Lockout expired
        set({ lockoutUntil: null, failedAttempts: 0 });
        localStorage.removeItem('muhafiz_lockout');
      }
    }
    set({ isLoading: true });
    try {
      const storedHash = await db.getPasswordHash();
      const inputHash = await hashPassword(password);
      if (storedHash === inputHash) {
        set({
          isAuthenticated: true,
          isLocked: false,
          isLoading: false,
          failedAttempts: 0,
          lockoutUntil: null
        });
        localStorage.removeItem('muhafiz_lockout');
        return true;
      }
      // Failed attempt logic
      const newAttempts = state.failedAttempts + 1;
      let newLockout: number | null = null;
      if (newAttempts >= 5) {
        newLockout = Date.now() + 30000; // 30 seconds lockout
        localStorage.setItem('muhafiz_lockout', newLockout.toString());
      }
      set({
        isLoading: false,
        failedAttempts: newAttempts,
        lockoutUntil: newLockout
      });
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
  renameWallet: async (id: string, newName: string) => {
    set({ isLoading: true });
    try {
      const state = get();
      const updatedWallets = state.wallets.map(w =>
        w.id === id ? { ...w, name: newName } : w
      );
      set({ wallets: updatedWallets });
      await db.saveData({
        wallets: updatedWallets,
        transactions: state.transactions,
        categories: state.categories,
        lastUpdated: Date.now()
      });
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: 'فشل تعديل اسم المحفظة' });
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
  openTransactionDrawer: (walletId, transactionId, mode) => {
    let determinedMode: DrawerMode = mode || 'create';
    // Auto-detect mode if not explicitly provided
    if (!mode) {
      if (transactionId) determinedMode = 'edit';
      else determinedMode = 'create';
    }
    set({
      isTransactionDrawerOpen: true,
      selectedWalletId: walletId || null,
      transactionIdToEdit: transactionId || null,
      drawerMode: determinedMode
    });
  },
  closeTransactionDrawer: () => {
    set({
      isTransactionDrawerOpen: false,
      selectedWalletId: null,
      transactionIdToEdit: null,
      drawerMode: 'create'
    });
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
  editTransaction: async (id, data) => {
    set({ isLoading: true });
    try {
      const state = get();
      const oldTx = state.transactions.find(t => t.id === id);
      if (!oldTx) {
        throw new Error("Transaction not found");
      }
      // 1. Revert old transaction effect
      let wallets = [...state.wallets];
      const oldWalletIndex = wallets.findIndex(w => w.id === oldTx.walletId);
      if (oldWalletIndex !== -1) {
        const w = wallets[oldWalletIndex];
        // If expense, add back. If deposit, subtract.
        const revertAmount = oldTx.type === 'expense' ? oldTx.amount : -oldTx.amount;
        wallets[oldWalletIndex] = { ...w, balance: w.balance + revertAmount };
      }
      // 2. Apply new transaction effect
      // Note: If walletId changed, we apply to new wallet. If same, we apply to the already modified wallet.
      const newWalletIndex = wallets.findIndex(w => w.id === data.walletId);
      if (newWalletIndex !== -1) {
        const w = wallets[newWalletIndex];
        // If expense, subtract. If deposit, add.
        const applyAmount = data.type === 'expense' ? -data.amount : data.amount;
        wallets[newWalletIndex] = { ...w, balance: w.balance + applyAmount };
      }
      // 3. Update transaction record
      const updatedTx: Transaction = {
        ...oldTx,
        ...data
      };
      const updatedTransactions = state.transactions.map(t => t.id === id ? updatedTx : t);
      set({
        wallets,
        transactions: updatedTransactions,
        isLoading: false,
        isTransactionDrawerOpen: false,
        transactionIdToEdit: null,
        selectedWalletId: null
      });
      await db.saveData({
        wallets,
        transactions: updatedTransactions,
        categories: state.categories,
        lastUpdated: Date.now()
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل تعديل العملية' });
    }
  },
  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      const state = get();
      const tx = state.transactions.find(t => t.id === id);
      if (!tx) {
        throw new Error("Transaction not found");
      }
      // Identify all transactions to delete (including related transfer)
      const idsToDelete = [id];
      if (tx.relatedTransactionId) {
        idsToDelete.push(tx.relatedTransactionId);
      }
      // 1. Revert transaction effects on wallets
      let wallets = [...state.wallets];
      // We need to process each transaction to delete to revert its effect
      idsToDelete.forEach(deleteId => {
        const t = state.transactions.find(tr => tr.id === deleteId);
        if (t) {
          const wIndex = wallets.findIndex(w => w.id === t.walletId);
          if (wIndex !== -1) {
            const w = wallets[wIndex];
            const revertAmount = t.type === 'expense' ? t.amount : -t.amount;
            wallets[wIndex] = { ...w, balance: w.balance + revertAmount };
          }
        }
      });
      // 2. Remove transactions
      const updatedTransactions = state.transactions.filter(t => !idsToDelete.includes(t.id));
      set({
        wallets,
        transactions: updatedTransactions,
        isLoading: false
      });
      await db.saveData({
        wallets,
        transactions: updatedTransactions,
        categories: state.categories,
        lastUpdated: Date.now()
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل حذف العملية' });
    }
  },
  transferFunds: async (fromWalletId, toWalletId, amount, date, notes) => {
    set({ isLoading: true });
    try {
      const state = get();
      const fromWallet = state.wallets.find(w => w.id === fromWalletId);
      const toWallet = state.wallets.find(w => w.id === toWalletId);
      if (!fromWallet || !toWallet) throw new Error("Wallet not found");
      if (fromWallet.balance < amount) throw new Error("Insufficient funds");
      const fromTxId = uuidv4();
      const toTxId = uuidv4();
      const now = Date.now();
      // 1. Create Expense (Source)
      const expenseTx: Transaction = {
        id: fromTxId,
        walletId: fromWalletId,
        amount,
        type: 'expense',
        categoryId: 'transfer_sys',
        isTransfer: true,
        relatedTransactionId: toTxId,
        date,
        notes,
        createdAt: now
      };
      // 2. Create Deposit (Target)
      const depositTx: Transaction = {
        id: toTxId,
        walletId: toWalletId,
        amount,
        type: 'deposit',
        categoryId: 'transfer_sys',
        isTransfer: true,
        relatedTransactionId: fromTxId,
        date,
        notes,
        createdAt: now
      };
      // 3. Update Wallets
      const updatedWallets = state.wallets.map(w => {
        if (w.id === fromWalletId) return { ...w, balance: w.balance - amount };
        if (w.id === toWalletId) return { ...w, balance: w.balance + amount };
        return w;
      });
      // 4. Update Transactions
      const newTransactions = [expenseTx, depositTx, ...state.transactions];
      set({
        wallets: updatedWallets,
        transactions: newTransactions,
        isLoading: false,
        isTransactionDrawerOpen: false
      });
      await db.saveData({
        wallets: updatedWallets,
        transactions: newTransactions,
        categories: state.categories,
        lastUpdated: now
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل تحويل الأموال' });
      throw err;
    }
  },
  addCategory: async (name: string) => {
    set({ isLoading: true });
    try {
      const id = uuidv4();
      const newCategory: Category = {
        id,
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
      return id;
    } catch (err) {
      set({ isLoading: false, error: 'فشل إضافة البند' });
      return undefined;
    }
  },
  updateCategory: async (id: string, newName: string) => {
    set({ isLoading: true });
    try {
      const state = get();
      const updatedCategories = state.categories.map(c =>
        c.id === id ? { ...c, name: newName } : c
      );
      set({ categories: updatedCategories, isLoading: false });
      await db.saveData({
        wallets: state.wallets,
        transactions: state.transactions,
        categories: updatedCategories,
        lastUpdated: Date.now()
      });
    } catch (err) {
      set({ isLoading: false, error: 'فشل تعديل البند' });
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
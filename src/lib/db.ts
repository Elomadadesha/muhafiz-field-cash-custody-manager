import { get, set, del } from 'idb-keyval';
import { AppData } from '@/types/app';
const DB_KEYS = {
  DATA: 'muhafiz_data',
  AUTH: 'muhafiz_auth', // Stores the password hash
  SETTINGS: 'muhafiz_settings',
};
export interface AppSettings {
  autoLockMinutes: number; // 0 = disabled
  lastActive: number;
  currency: 'SAR' | 'EGP' | 'USD';
}
export const CURRENCIES = {
  SAR: { label: 'ريال سعودي', symbol: 'ر.س' },
  EGP: { label: 'جنيه مصري', symbol: 'ج.م' },
  USD: { label: 'دولار أمريكي', symbol: '$' },
};
const INITIAL_DATA: AppData = {
  wallets: [],
  transactions: [],
  categories: [
    { id: 'cat_1', name: 'مواصلا��', isSystem: true },
    { id: 'cat_2', name: 'وقود', isSystem: true },
    { id: 'cat_3', name: 'صيانة', isSystem: true },
    { id: 'cat_4', name: 'قطع غيار', isSystem: true },
    { id: 'cat_5', name: 'إعاشة', isSystem: true },
    { id: 'cat_6', name: 'أخرى', isSystem: true },
  ],
  lastUpdated: Date.now(),
};
const INITIAL_SETTINGS: AppSettings = {
  autoLockMinutes: 5,
  lastActive: Date.now(),
  currency: 'EGP',
};
export const db = {
  // Data Operations
  getData: async (): Promise<AppData> => {
    const data = await get<AppData>(DB_KEYS.DATA);
    return data || INITIAL_DATA;
  },
  saveData: async (data: AppData): Promise<void> => {
    await set(DB_KEYS.DATA, data);
  },
  // Auth Operations
  getPasswordHash: async (): Promise<string | undefined> => {
    return await get<string>(DB_KEYS.AUTH);
  },
  setPasswordHash: async (hash: string): Promise<void> => {
    await set(DB_KEYS.AUTH, hash);
  },
  clearAuth: async (): Promise<void> => {
    await del(DB_KEYS.AUTH);
  },
  // Settings Operations
  getSettings: async (): Promise<AppSettings> => {
    const settings = await get<AppSettings>(DB_KEYS.SETTINGS);
    return { ...INITIAL_SETTINGS, ...settings }; // Merge to ensure new fields exist
  },
  saveSettings: async (settings: AppSettings): Promise<void> => {
    await set(DB_KEYS.SETTINGS, settings);
  },
  // Full Reset (for debugging or wiping)
  clearAll: async (): Promise<void> => {
    await del(DB_KEYS.DATA);
    await del(DB_KEYS.AUTH);
    await del(DB_KEYS.SETTINGS);
  }
};
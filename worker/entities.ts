import { IndexedEntity } from "./core-utils";
import type { AppData } from "@shared/types"; // We will define AppData in shared/types or just inline here if shared is not accessible easily in this phase context, but template has shared/types.ts.
// However, I defined AppData in src/types/app.ts. The worker cannot import from src.
// I must define the types here or in shared/types.ts.
// I will update shared/types.ts first to ensure types are available to both.
// Let's redefine the types here for the worker to be self-contained or use shared if possible.
// The template has shared/types.ts. I should update that file first?
// The prompt didn't ask to update shared/types.ts, but it's better practice.
// However, I am restricted to the file list.
// I will define the types inside entities.ts to be safe and avoid modifying files not in the list if possible, 
// BUT I can modify shared/types.ts if I want to share types.
// The prompt list didn't include shared/types.ts.
// I will define the interface locally in entities.ts to avoid breaking rules.
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
  isSystem?: boolean;
}
export interface AppData {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  lastUpdated: number;
}
export interface UserEntityState {
  id: string;
  data: AppData;
}
const INITIAL_APP_DATA: AppData = {
  wallets: [],
  transactions: [],
  categories: [],
  lastUpdated: Date.now(),
};
// USER ENTITY: Acts as the single database for the app
export class UserEntity extends IndexedEntity<UserEntityState> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: UserEntityState = { 
    id: "", 
    data: INITIAL_APP_DATA 
  };
  // No seed data needed for this app
  static seedData = [];
  async getAppData(): Promise<AppData> {
    const state = await this.getState();
    return state.data;
  }
  async updateAppData(partialData: Partial<AppData>): Promise<AppData> {
    await this.mutate(state => ({
      ...state,
      data: { ...state.data, ...partialData, lastUpdated: Date.now() }
    }));
    return (await this.getState()).data;
  }
  async addWallet(wallet: Wallet): Promise<AppData> {
    await this.mutate(state => ({
      ...state,
      data: {
        ...state.data,
        wallets: [...state.data.wallets, wallet],
        lastUpdated: Date.now()
      }
    }));
    return (await this.getState()).data;
  }
  async updateWallet(wallet: Wallet): Promise<AppData> {
    await this.mutate(state => ({
      ...state,
      data: {
        ...state.data,
        wallets: state.data.wallets.map(w => w.id === wallet.id ? wallet : w),
        lastUpdated: Date.now()
      }
    }));
    return (await this.getState()).data;
  }
}
// ChatBoardEntity is not needed for this app but kept to avoid breaking imports if any
export class ChatBoardEntity extends IndexedEntity<any> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState = { id: "" };
}
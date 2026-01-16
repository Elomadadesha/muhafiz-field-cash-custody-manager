import { IndexedEntity } from "./core-utils";
import type { AppData, Wallet, Transaction } from "@shared/types";
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
  async addTransaction(transaction: Transaction): Promise<AppData> {
    await this.mutate(state => {
      const { walletId, amount, type } = transaction;
      const walletIndex = state.data.wallets.findIndex(w => w.id === walletId);
      if (walletIndex === -1) {
        // If wallet not found, we can't process. 
        // In a real app, we might throw, but here we'll just return state unchanged or log.
        // Throwing ensures the API returns an error.
        throw new Error("Wallet not found");
      }
      const wallet = state.data.wallets[walletIndex];
      let newBalance = wallet.balance;
      // Calculate new balance
      if (type === 'expense') {
        newBalance -= amount;
      } else {
        newBalance += amount;
      }
      // Update wallet
      const updatedWallet = { ...wallet, balance: newBalance };
      const updatedWallets = [...state.data.wallets];
      updatedWallets[walletIndex] = updatedWallet;
      // Prepend transaction
      const updatedTransactions = [transaction, ...state.data.transactions];
      return {
        ...state,
        data: {
          ...state.data,
          wallets: updatedWallets,
          transactions: updatedTransactions,
          lastUpdated: Date.now()
        }
      };
    });
    return (await this.getState()).data;
  }
}
// ChatBoardEntity is not needed for this app but kept to avoid breaking imports if any
export class ChatBoardEntity extends IndexedEntity<any> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState = { id: "" };
}
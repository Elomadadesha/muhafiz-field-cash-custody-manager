import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity } from "./entities";
import { ok, bad } from './core-utils';
import type { Transaction } from "@shared/types";
// Hardcoded ID for the single user application
const MAIN_USER_ID = "muhafiz-main-user";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SYNC: Get full app state
  app.get('/api/sync', async (c) => {
    // Ensure the user entity exists
    const user = await UserEntity.create(c.env, { id: MAIN_USER_ID, data: UserEntity.initialState.data });
    // Fetch fresh state
    const entity = new UserEntity(c.env, MAIN_USER_ID);
    const data = await entity.getAppData();
    return ok(c, data);
  });
  // WALLET: Add or Update
  app.post('/api/wallet', async (c) => {
    const wallet = await c.req.json();
    if (!wallet || !wallet.id || !wallet.name) return bad(c, 'Invalid wallet data');
    const entity = new UserEntity(c.env, MAIN_USER_ID);
    // Check if wallet exists to decide update vs add
    const currentData = await entity.getAppData();
    const exists = currentData.wallets.some((w: any) => w.id === wallet.id);
    let updatedData;
    if (exists) {
      updatedData = await entity.updateWallet(wallet);
    } else {
      updatedData = await entity.addWallet(wallet);
    }
    return ok(c, updatedData);
  });
  // TRANSACTION: Add new transaction
  app.post('/api/transaction', async (c) => {
    const transaction = await c.req.json<Transaction>();
    if (!transaction || !transaction.id || !transaction.walletId || !transaction.amount) {
      return bad(c, 'Invalid transaction data');
    }
    const entity = new UserEntity(c.env, MAIN_USER_ID);
    try {
      const updatedData = await entity.addTransaction(transaction);
      return ok(c, updatedData);
    } catch (e: any) {
      return bad(c, e.message || 'Failed to add transaction');
    }
  });
  // Keep health check or other utilities if needed
  app.get('/api/test', (c) => c.json({ success: true, message: 'Muhafiz API Ready' }));
}
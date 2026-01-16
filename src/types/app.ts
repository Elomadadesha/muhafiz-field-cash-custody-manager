export * from '@shared/types';
// Backend Entity State (Frontend doesn't strictly need this but useful for reference)
import { AppData } from '@shared/types';
export interface UserEntityState {
  id: string;
  data: AppData;
}
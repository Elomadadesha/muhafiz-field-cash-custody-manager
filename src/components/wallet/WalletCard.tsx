import { Wallet } from '@/types/app';
import { Wallet as WalletIcon, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
interface WalletCardProps {
  wallet: Wallet;
  onClick?: () => void;
}
export function WalletCard({ wallet, onClick }: WalletCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 border cursor-pointer active:scale-98",
        wallet.isActive
          ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md"
          : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-3 rounded-xl transition-colors",
          wallet.isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-slate-100 text-slate-400"
        )}>
          <WalletIcon className="w-6 h-6" />
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{wallet.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-bold tabular-nums tracking-tight",
            wallet.isActive ? "text-slate-900 dark:text-white" : "text-slate-400"
          )}>
            {wallet.balance.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-slate-400 font-medium">ر.س</span>
        </div>
      </div>
      {/* Decorative gradient blob */}
      {wallet.isActive && (
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
      )}
    </div>
  );
}
import { Wallet } from '@/types/app';
import { Wallet as WalletIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
interface WalletCardProps {
  wallet: Wallet;
  currencySymbol: string;
  onClick?: () => void;
}
export function WalletCard({ wallet, currencySymbol, onClick }: WalletCardProps) {
  const settings = useAppStore(s => s.settings);
  const thresholds = settings.balanceThresholds || { low: 100, medium: 500 };
  // Determine Status Color
  let statusColor = 'green'; // Default Good
  if (wallet.balance < thresholds.low) statusColor = 'red';
  else if (wallet.balance < thresholds.medium) statusColor = 'yellow';
  // Budget Calculation
  const budget = wallet.budget || 0;
  const budgetUsedPercent = budget > 0 ? Math.min(100, Math.max(0, ((budget - wallet.balance) / budget) * 100)) : 0;
  // Alternatively, if budget is "spending limit", we might want to track expenses against it.
  // But here budget usually means "Max Custody Amount".
  // Let's assume budget is "Target Balance" or "Max Balance".
  // If budget is 2000, and balance is 1500, we have 75% remaining?
  // Let's visualize "Remaining Balance" vs "Budget".
  const balancePercent = budget > 0 ? Math.min(100, Math.max(0, (wallet.balance / budget) * 100)) : 0;
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer active:scale-98 border",
        wallet.isActive
          ? (statusColor === 'red'
              ? "bg-gradient-to-br from-red-900 to-slate-900 border-red-800"
              : (statusColor === 'yellow'
                  ? "bg-gradient-to-br from-amber-900 to-slate-900 border-amber-800"
                  : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"))
          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70"
      )}
    >
      {/* Background Patterns */}
      {wallet.isActive && (
        <>
          <div className={cn(
            "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-20",
            statusColor === 'red' ? "bg-red-500" : (statusColor === 'yellow' ? "bg-amber-500" : "bg-emerald-500")
          )} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        </>
      )}
      <div className="relative z-10 flex flex-col h-full justify-between min-h-[110px]">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "p-2.5 rounded-xl backdrop-blur-md transition-colors border",
            wallet.isActive
              ? (statusColor === 'red'
                  ? "bg-red-500/20 text-red-200 border-red-500/30"
                  : (statusColor === 'yellow'
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"))
              : "bg-white text-slate-400 border-slate-100"
          )}>
            <WalletIcon className="w-5 h-5" />
          </div>
          {wallet.isActive && (
            <div className={cn(
              "px-2 py-1 rounded-lg border text-[10px] font-bold",
              statusColor === 'red'
                ? "bg-red-500/20 border-red-500/30 text-red-200"
                : (statusColor === 'yellow'
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-200"
                    : "bg-emerald-500/20 border-emerald-500/30 text-emerald-200")
            )}>
              {statusColor === 'red' ? 'رصيد منخفض' : (statusColor === 'yellow' ? 'متوسط' : 'نشط')}
            </div>
          )}
        </div>
        <div>
          <h3 className={cn(
            "text-sm font-medium mb-1",
            wallet.isActive ? "text-slate-300" : "text-slate-500"
          )}>
            {wallet.name}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "text-3xl font-bold tabular-nums tracking-tight",
              wallet.isActive
                ? (statusColor === 'red' ? "text-red-400" : (statusColor === 'yellow' ? "text-amber-400" : "text-white"))
                : "text-slate-900 dark:text-white"
            )}>
              {wallet.balance.toLocaleString('en-US')}
            </span>
            <span className={cn(
              "text-sm font-medium",
              wallet.isActive ? "text-slate-400" : "text-slate-400"
            )}>
              {currencySymbol}
            </span>
          </div>
          {/* Budget Progress */}
          {wallet.isActive && budget > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>الميزانية: {budget.toLocaleString()}</span>
                <span>{Math.round(balancePercent)}%</span>
              </div>
              <Progress value={balancePercent} className="h-1.5 bg-slate-700" indicatorClassName={cn(
                statusColor === 'red' ? "bg-red-500" : (statusColor === 'yellow' ? "bg-amber-500" : "bg-emerald-500")
              )} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
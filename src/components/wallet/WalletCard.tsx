import { Wallet } from '@/types/app';
import { Wallet as WalletIcon, MoreVertical, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
interface WalletCardProps {
  wallet: Wallet;
  currencySymbol: string;
  onClick?: () => void;
}
export function WalletCard({ wallet, currencySymbol, onClick }: WalletCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer active:scale-98",
        wallet.isActive
          ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/10"
          : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-70"
      )}
    >
      {/* Background Patterns for Active Card */}
      {wallet.isActive && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        </>
      )}
      <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "p-2.5 rounded-xl backdrop-blur-md",
            wallet.isActive ? "bg-white/10 text-white border border-white/10" : "bg-white text-slate-400 border border-slate-100"
          )}>
            <WalletIcon className="w-5 h-5" />
          </div>
          {wallet.isActive && (
            <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-[10px] font-medium text-white/80">
              نشط
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
              wallet.isActive ? "text-white" : "text-slate-900 dark:text-white"
            )}>
              {wallet.balance.toLocaleString('en-US')}
            </span>
            <span className={cn(
              "text-sm font-medium",
              wallet.isActive ? "text-blue-300" : "text-slate-400"
            )}>
              {currencySymbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
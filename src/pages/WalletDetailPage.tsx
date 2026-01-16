import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { CURRENCIES } from '@/lib/db';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Transaction } from '@/types/app';
export function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = useAppStore(s => s.wallets.find(w => w.id === id));
  const transactions = useAppStore(s => s.transactions.filter(t => t.walletId === id).sort((a, b) => b.date - a.date));
  const categories = useAppStore(s => s.categories);
  const settings = useAppStore(s => s.settings);
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
  const currency = CURRENCIES[settings.currency];
  if (!wallet) {
    return (
      <RtlWrapper className="justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">المحفظة غير موجودة</h2>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">عودة للرئيسية</Button>
        </div>
      </RtlWrapper>
    );
  }
  const getCategoryName = (tx: Transaction) => {
    if (tx.categoryId === 'deposit_sys') return 'تغذية رصيد';
    if (tx.categoryId === 'custom') return tx.customCategoryName || 'مصروف مخصص';
    return categories.find(c => c.id === tx.categoryId)?.name || 'غير محدد';
  };
  return (
    <RtlWrapper>
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{wallet.name}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">تفاصيل العمليات</p>
        </div>
        <Button
          size="sm"
          onClick={() => openTransactionDrawer(wallet.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
        >
          <Plus className="w-4 h-4 ml-1" />
          عملية
        </Button>
      </header>
      {/* Balance Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">الرصيد الحالي</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold tabular-nums tracking-tight">{wallet.balance.toLocaleString()}</h2>
              <span className="text-blue-300 font-medium text-lg">{currency.symbol}</span>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        </div>
      </div>
      {/* Transactions List */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-6 pt-8 pb-safe overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">سجل العمليات</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">لا توجد عمليات مسجلة لهذه المحفظة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm",
                  tx.type === 'expense'
                    ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                )}>
                  {tx.type === 'expense' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{getCategoryName(tx)}</h4>
                    <span className={cn(
                      "font-bold tabular-nums whitespace-nowrap",
                      tx.type === 'expense' ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                    )}>
                      {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{format(tx.date, "d MMM, h:mm a", { locale: arSA })}</span>
                    </div>
                    {tx.notes && <span className="truncate max-w-[120px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{tx.notes}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </RtlWrapper>
  );
}
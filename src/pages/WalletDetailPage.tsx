import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { CURRENCIES } from '@/lib/db';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight, MoreVertical, Pencil, Trash2, Copy, Receipt, TrendingUp, Handshake, Target } from 'lucide-react';
import { format, isToday, isYesterday, subDays, isSameDay } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Transaction } from '@/types/app';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionReceipt } from '@/components/transaction/TransactionReceipt';
import { ReconciliationDialog } from '@/components/wallet/ReconciliationDialog';
export function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = useAppStore(s => s.wallets.find(w => w.id === id));
  const allTransactions = useAppStore(s => s.transactions);
  const categories = useAppStore(s => s.categories);
  const settings = useAppStore(s => s.settings);
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
  const deleteTransaction = useAppStore(s => s.deleteTransaction);
  const currency = CURRENCIES[settings.currency];
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'deposit'>('all');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  // Filter transactions for this wallet and by type
  const filteredTransactions = useMemo(() => {
    if (!id) return [];
    return allTransactions
      .filter(t => {
        if (t.walletId !== id) return false;
        if (filterType !== 'all' && t.type !== filterType) return false;
        return true;
      })
      .sort((a, b) => b.date - a.date);
  }, [allTransactions, id, filterType]);
  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(tx => {
      const dateKey = format(tx.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredTransactions]);
  // Chart Data: Last 7 Days Expenses for THIS wallet
  const chartData = useMemo(() => {
    if (!id) return [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayExpenses = allTransactions
        .filter(t =>
          t.walletId === id &&
          t.type === 'expense' &&
          isSameDay(new Date(t.date), date)
        )
        .reduce((acc, t) => acc + t.amount, 0);
      data.push({
        name: format(date, 'EEEE', { locale: arSA }),
        shortName: format(date, 'EEE', { locale: arSA }),
        date: format(date, 'd MMM', { locale: arSA }),
        amount: dayExpenses
      });
    }
    return data;
  }, [allTransactions, id]);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  if (!wallet) {
    return (
      <RtlWrapper className="justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">المحفظة غير مو��ودة</h2>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">عودة للرئيسية</Button>
        </div>
      </RtlWrapper>
    );
  }
  const getCategoryName = (tx: Transaction) => {
    if (tx.categoryId === 'deposit_sys') return 'تغذية رصيد';
    if (tx.categoryId === 'transfer_sys') return 'تحويل أموال';
    if (tx.categoryId === 'reconcile_sys') return 'تصفية عُهدة';
    if (tx.categoryId === 'custom') return tx.customCategoryName || 'مصروف مخصص';
    return categories.find(c => c.id === tx.categoryId)?.name || 'غير محدد';
  };
  const handleDelete = async (txId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه العملية؟ سيتم تحديث رصيد المحفظة تلق��ئياً.')) {
      await deleteTransaction(txId);
      toast.success('تم حذف العملية بنجاح');
    }
  };
  const handleViewReceipt = (tx: Transaction) => {
    setSelectedTxForReceipt(tx);
    setIsReceiptOpen(true);
  };
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'اليوم';
    if (isYesterday(date)) return 'أمس';
    return format(date, 'EEEE، d MMMM', { locale: arSA });
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReconcileOpen(true)}
            className="rounded-full px-3 h-9 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200"
          >
            <Handshake className="w-4 h-4 ml-1" />
            تصفية
          </Button>
          <Button
            size="sm"
            onClick={() => openTransactionDrawer(wallet.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-9"
          >
            <Plus className="w-4 h-4 ml-1" />
            عملية
          </Button>
        </div>
      </header>
      {/* Balance Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">الرصيد ال��الي</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold tabular-nums tracking-tight">{wallet.balance.toLocaleString()}</h2>
                  <span className="text-blue-300 font-medium text-lg">{currency.symbol}</span>
                </div>
              </div>
              {wallet.budget && wallet.budget > 0 && (
                <div className="text-left bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-1 text-slate-300 text-[10px] mb-0.5">
                    <Target className="w-3 h-3" />
                    <span>الميزانية</span>
                  </div>
                  <p className="font-bold text-sm">{wallet.budget.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        </div>
      </div>
      {/* Wallet Analytics Chart */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">مصروفات العُهدة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">آخر 7 أيام</p>
            </div>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWalletExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
                          <p className="font-bold mb-1">{payload[0].payload.date}</p>
                          <p className="font-mono text-red-300">-{Number(payload[0].value).toLocaleString()} {currency.symbol}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWalletExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Transactions List */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-6 pt-8 pb-safe overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">سجل العمليات</h3>
          {/* Filter Controls */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filterType === 'all'
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filterType === 'expense'
                  ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              مصروفات
            </button>
            <button
              onClick={() => setFilterType('deposit')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filterType === 'deposit'
                  ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              إيداعات
            </button>
          </div>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">لا توجد عمليات مطابقة للفلتر</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <h4 className="text-xs font-bold text-slate-400 mb-3 sticky top-0 bg-white dark:bg-slate-900 py-2 z-10">
                  {getDateLabel(dateKey)}
                </h4>
                <div className="space-y-4">
                  {groupedTransactions[dateKey].map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative"
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
                            <span>{format(tx.date, "h:mm a", { locale: arSA })}</span>
                          </div>
                          {tx.notes && <span className="truncate max-w-[100px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{tx.notes}</span>}
                        </div>
                      </div>
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-right">
                          <DropdownMenuItem onClick={() => handleViewReceipt(tx)} className="gap-2 cursor-pointer flex-row-reverse">
                            <Receipt className="w-4 h-4" />
                            <span>عرض الإيصال</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openTransactionDrawer(tx.walletId, tx.id, 'edit')} className="gap-2 cursor-pointer flex-row-reverse">
                            <Pencil className="w-4 h-4" />
                            <span>تعديل</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openTransactionDrawer(tx.walletId, tx.id, 'duplicate')} className="gap-2 cursor-pointer flex-row-reverse">
                            <Copy className="w-4 h-4" />
                            <span>تكرار</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(tx.id)} className="gap-2 text-red-600 focus:text-red-600 cursor-pointer flex-row-reverse">
                            <Trash2 className="w-4 h-4" />
                            <span>حذف</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Receipt Dialog */}
      <TransactionReceipt
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        transaction={selectedTxForReceipt}
        wallet={wallet}
        categoryName={selectedTxForReceipt ? getCategoryName(selectedTxForReceipt) : ''}
      />
      {/* Reconciliation Dialog */}
      <ReconciliationDialog
        open={isReconcileOpen}
        onOpenChange={setIsReconcileOpen}
        wallet={wallet}
      />
    </RtlWrapper>
  );
}
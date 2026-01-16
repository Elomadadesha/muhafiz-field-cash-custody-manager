import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { CURRENCIES } from '@/lib/db';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { WalletCard } from '@/components/wallet/WalletCard';
import { Bell, Search, Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isSameDay } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { SearchDialog } from '@/components/search/SearchDialog';
import { getTimeBasedGreeting } from '@/lib/utils';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
export function DashboardPage() {
  const wallets = useAppStore(s => s.wallets);
  const addWallet = useAppStore(s => s.addWallet);
  const isLoading = useAppStore(s => s.isLoading);
  const transactions = useAppStore(s => s.transactions);
  const settings = useAppStore(s => s.settings);
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletBudget, setNewWalletBudget] = useState('');
  const navigate = useNavigate();
  const currency = CURRENCIES[settings.currency];
  const totalBalance = wallets.reduce((acc, w) => w.isActive ? acc + w.balance : acc, 0);
  // Calculate today's expenses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && t.date >= today.getTime())
    .reduce((acc, t) => acc + t.amount, 0);
  // Prepare Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), date))
        .reduce((acc, t) => acc + t.amount, 0);
      data.push({
        name: format(date, 'EEEE', { locale: arSA }),
        shortName: format(date, 'EEE', { locale: arSA }),
        date: format(date, 'd MMM', { locale: arSA }),
        amount: dayExpenses
      });
    }
    return data;
  }, [transactions]);
  const handleAddWallet = async () => {
    if (!newWalletName) return;
    const balance = parseFloat(newWalletBalance) || 0;
    const budget = parseFloat(newWalletBudget) || 0;
    await addWallet(newWalletName, balance, budget);
    setIsAddOpen(false);
    setNewWalletName('');
    setNewWalletBalance('');
    setNewWalletBudget('');
    toast.success('تم إضا��ة المحفظة بنجاح');
  };
  return (
    <RtlWrapper>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {getTimeBasedGreeting('مصطف��')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(), 'EEEE، d MMMM', { locale: arSA })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
          </button>
        </div>
      </header>
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-6 pb-24 overflow-y-auto space-y-8"
      >
        {/* Total Balance Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-[2rem] bg-blue-600 p-6 text-white shadow-xl shadow-blue-600/20 group"
        >
          {/* Advanced Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]"></span>
              إجمالي الرصيد الحالي
            </p>
            <div className="flex items-baseline gap-2 mb-8">
              <h2 className="text-5xl font-bold tracking-tight tabular-nums drop-shadow-sm">
                {totalBalance.toLocaleString('en-US')}
              </h2>
              <span className="text-blue-200 font-medium text-xl">{currency.symbol}</span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-full bg-red-500/20 text-red-100">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-blue-100">مصروفات اليوم</p>
                </div>
                <p className="text-lg font-bold tabular-nums">{todayExpenses.toLocaleString('en-US')}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-100">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-blue-100">العُهد النشطة</p>
                </div>
                <p className="text-lg font-bold tabular-nums">{wallets.filter(w => w.isActive).length}</p>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Spending Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">اتجاه المصروفات</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">آخر 7 أيام</p>
            </div>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                          <p className="font-mono">{Number(payload[0].value).toLocaleString()} {currency.symbol}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 px-1">إجراءات سريعة</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => openTransactionDrawer()}
              className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-red-100 dark:hover:border-red-900/30 transition-all active:scale-95 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">تسجيل مصروف</span>
                <span className="text-[10px] text-slate-400">خصم من عُهدة</span>
              </div>
            </button>
            <button
              onClick={() => openTransactionDrawer()}
              className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 transition-all active:scale-95 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">إضافة رصيد</span>
                <span className="text-[10px] text-slate-400">تغذية عُهدة</span>
              </div>
            </button>
          </div>
        </div>
        {/* Wallets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">محافظ العُهد</h3>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1 rounded-xl px-3 h-9">
                  <Plus className="w-4 h-4" />
                  <span>جديدة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة عُهدة جديدة</DialogTitle>
                  <DialogDescription className="text-right text-slate-500">
                    أدخل اسم العُهدة والرصيد الافتتاحي لإنشاء محفظة جديدة.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-right block">اسم العُهدة</Label>
                    <Input
                      placeholder="مثال: عُهدة وقود"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      className="text-right h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block">الرصيد الافتتاحي</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newWalletBalance}
                        onChange={(e) => setNewWalletBalance(e.target.value)}
                        className="text-right ltr-placeholder h-12 rounded-xl pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{currency.symbol}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block">سقف الميزانية (اختياري)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newWalletBudget}
                        onChange={(e) => setNewWalletBudget(e.target.value)}
                        className="text-right ltr-placeholder h-12 rounded-xl pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{currency.symbol}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <Button onClick={handleAddWallet} className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12 rounded-xl">
                    حفظ العُهدة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {isLoading && wallets.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : wallets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {wallets.map(wallet => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  currencySymbol={currency.symbol}
                  onClick={() => navigate(`/wallet/${wallet.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-medium mb-1">لا توجد عُهد حالياً</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">قم بإضافة عُهدة جديدة للبدء</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddOpen(true)}
              >
                إضافة عُهدة
              </Button>
            </div>
          )}
        </div>
      </motion.main>
      <BottomNav />
    </RtlWrapper>
  );
}
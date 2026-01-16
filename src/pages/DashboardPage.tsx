import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { WalletCard } from '@/components/wallet/WalletCard';
import { Bell, Search, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
export function DashboardPage() {
  const wallets = useAppStore(s => s.wallets);
  const addWallet = useAppStore(s => s.addWallet);
  const isLoading = useAppStore(s => s.isLoading);
  const transactions = useAppStore(s => s.transactions);
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const navigate = useNavigate();
  const totalBalance = wallets.reduce((acc, w) => w.isActive ? acc + w.balance : acc, 0);
  // Calculate today's expenses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && t.date >= today.getTime())
    .reduce((acc, t) => acc + t.amount, 0);
  const handleAddWallet = async () => {
    if (!newWalletName) return;
    const balance = parseFloat(newWalletBalance) || 0;
    await addWallet(newWalletName, balance);
    setIsAddOpen(false);
    setNewWalletName('');
    setNewWalletBalance('');
    toast.success('تم إضافة المحفظة بنجا��');
  };
  return (
    <RtlWrapper>
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مرحباً، الموظف</h1>
          <p className="text-sm text-slate-500">
            {format(new Date(), 'EEEE، d MMMM', { locale: arSA })}
          </p>
        </div>
        <button className="p-2 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-emerald-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>
      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 overflow-y-auto space-y-8">
        {/* Total Balance Card - Visually Enhanced */}
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20 group">
          {/* Decorative Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-500"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              إجمالي الرصيد الحالي
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-5xl font-bold tracking-tight tabular-nums">
                {totalBalance.toLocaleString('en-US')}
              </h2>
              <span className="text-emerald-400 font-medium text-lg">ر.س</span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-full bg-red-500/20 text-red-300">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-slate-300">مصروفات اليو��</p>
                </div>
                <p className="text-lg font-semibold tabular-nums">{todayExpenses.toLocaleString('en-US')}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                    <ArrowDownLeft className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-slate-300">العُهد النشطة</p>
                </div>
                <p className="text-lg font-semibold tabular-nums">{wallets.filter(w => w.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 px-1">إجراءات سريعة</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => openTransactionDrawer()}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all active:scale-98 group"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-900">تسجيل مصروف</span>
                <span className="text-xs text-slate-500">خصم من عُهدة</span>
              </div>
            </button>
            <button 
              onClick={() => openTransactionDrawer()}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all active:scale-98 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-900">إضافة رصيد</span>
                <span className="text-xs text-slate-500">تغذية عُهدة</span>
              </div>
            </button>
          </div>
        </div>
        {/* Wallets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-900">محافظ العُهد</h3>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 rounded-full px-3">
                  <Plus className="w-4 h-4" />
                  <span>جديدة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة عُهدة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-right block">اسم العُهدة</Label>
                    <Input
                      placeholder="مثال: عُهدة وقود"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block">الرصيد الافتتاحي</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newWalletBalance}
                      onChange={(e) => setNewWalletBalance(e.target.value)}
                      className="text-right ltr-placeholder"
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <Button onClick={handleAddWallet} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                    حفظ العُهدة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {isLoading && wallets.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : wallets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {wallets.map(wallet => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onClick={() => navigate(`/wallet/${wallet.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">لا توجد عُهد ��الياً</h3>
              <p className="text-slate-500 text-sm">قم بإضافة عُهدة جديدة للبدء</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </RtlWrapper>
  );
}
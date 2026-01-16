import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { WalletCard } from '@/components/wallet/WalletCard';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export function DashboardPage() {
  const wallets = useAppStore(s => s.wallets);
  const sync = useAppStore(s => s.sync);
  const addWallet = useAppStore(s => s.addWallet);
  const isLoading = useAppStore(s => s.isLoading);
  const transactions = useAppStore(s => s.transactions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    sync();
  }, [sync]);
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
    toast.success('تم إضافة المحفظة بنجاح');
  };
  return (
    <RtlWrapper>
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مرحباً، الموظف</h1>
          <p className="text-sm text-slate-500">نظرة عامة على العُهد</p>
        </div>
        <button className="p-2 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-emerald-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>
      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 overflow-y-auto space-y-6">
        {/* Total Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-2">إجمالي الرصيد الحالي</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold tracking-tight tabular-nums">
                {totalBalance.toLocaleString('en-US')}
              </h2>
              <span className="text-emerald-400 font-medium">ر.س</span>
            </div>
            <div className="mt-6 flex gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-xs text-slate-400 mb-1">المصروفات (اليوم)</p>
                <p className="text-lg font-semibold tabular-nums">{todayExpenses.toLocaleString('en-US')}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-xs text-slate-400 mb-1">عدد العُهد النشطة</p>
                <p className="text-lg font-semibold tabular-nums">{wallets.filter(w => w.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Wallets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">محافظ العُهد</h3>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1">
                  <Plus className="w-4 h-4" />
                  <span>إضافة ��ُهدة</span>
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
              <h3 className="text-slate-900 font-medium mb-1">لا توجد عُهد حالياً</h3>
              <p className="text-slate-500 text-sm">قم بإضافة عُهدة جديدة للبدء</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </RtlWrapper>
  );
}
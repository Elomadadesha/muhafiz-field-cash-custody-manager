import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { CalendarIcon, Banknote, Wrench, Bus, Utensils, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
// Helper to map category names to icons
const getCategoryIcon = (name: string) => {
  if (name.includes('مواصلات')) return <Bus className="w-5 h-5" />;
  if (name.includes('وقود')) return <Banknote className="w-5 h-5" />;
  if (name.includes('صيانة')) return <Wrench className="w-5 h-5" />;
  if (name.includes('إعاشة')) return <Utensils className="w-5 h-5" />;
  if (name.includes('قطع')) return <SettingsIcon className="w-5 h-5" />;
  return <ShoppingBag className="w-5 h-5" />;
};
// Simple icon wrapper
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
export function TransactionDrawer() {
  const isOpen = useAppStore(s => s.isTransactionDrawerOpen);
  const closeDrawer = useAppStore(s => s.closeTransactionDrawer);
  const wallets = useAppStore(s => s.wallets);
  const categories = useAppStore(s => s.categories);
  const selectedWalletId = useAppStore(s => s.selectedWalletId);
  const addTransaction = useAppStore(s => s.addTransaction);
  const isLoading = useAppStore(s => s.isLoading);
  const [type, setType] = useState<'expense' | 'deposit'>('expense');
  const [walletId, setWalletId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  // Sync selected wallet from store
  useEffect(() => {
    if (isOpen) {
      if (selectedWalletId) {
        setWalletId(selectedWalletId);
      } else if (wallets.length > 0 && !walletId) {
        // Default to first active wallet if none selected
        const firstActive = wallets.find(w => w.isActive);
        if (firstActive) setWalletId(firstActive.id);
      }
      // Reset other fields
      setAmount('');
      setNotes('');
      setCategoryId('');
      setDate(new Date());
      setType('expense');
    }
  }, [isOpen, selectedWalletId, wallets, walletId]);
  const handleSubmit = async () => {
    if (!walletId) {
      toast.error('الر��اء اختيار المحفظة');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صح��ح');
      return;
    }
    if (type === 'expense' && !categoryId) {
      toast.error('الرجاء اختيار بن�� الصرف');
      return;
    }
    try {
      await addTransaction({
        walletId,
        amount: parseFloat(amount),
        type,
        categoryId: type === 'deposit' ? 'deposit_sys' : categoryId, // System category for deposits
        date: date ? date.getTime() : Date.now(),
        notes
      });
      toast.success(type === 'expense' ? 'تم تسجيل المصروف' : 'تم إضافة الر��يد');
      closeDrawer();
    } catch (error) {
      toast.error('حدث خطأ أثناء ��فظ العملية');
    }
  };
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <DrawerContent className="max-h-[90vh]" dir="rtl">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl font-bold">تسجيل عملية جديد��</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setType('expense')}
                className={cn(
                  "py-2.5 text-sm font-medium rounded-lg transition-all",
                  type === 'expense'
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                صرف (مصروفات)
              </button>
              <button
                onClick={() => setType('deposit')}
                className={cn(
                  "py-2.5 text-sm font-medium rounded-lg transition-all",
                  type === 'deposit'
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                إيداع (تغذية)
              </button>
            </div>
            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="text-right block text-slate-500">المبلغ</Label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-center text-3xl font-bold h-16 rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/20 ltr-placeholder"
                  autoFocus
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ر.س</span>
              </div>
            </div>
            {/* Wallet Selection */}
            <div className="space-y-2">
              <Label className="text-right block text-slate-500">المحفظة</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 text-right flex-row-reverse">
                  <SelectValue placeholder="اختر المحفظة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {wallets.filter(w => w.isActive).map(w => (
                    <SelectItem key={w.id} value={w.id} className="text-right flex-row-reverse">
                      {w.name} ({w.balance.toLocaleString()} ر.س)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Category Selection (Only for Expense) */}
            {type === 'expense' && (
              <div className="space-y-3">
                <Label className="text-right block text-slate-500">بند الصرف</Label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                        categoryId === cat.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        categoryId === cat.id ? "bg-primary text-white" : "bg-slate-100"
                      )}>
                        {getCategoryIcon(cat.name)}
                      </div>
                      <span className="text-xs font-medium truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Date & Notes */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-right block text-slate-500">التاريخ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-right font-normal h-12 rounded-xl border-slate-200",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: arSA }) : <span>اختر التاريخ</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-right block text-slate-500">ملاحظات (اختياري)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف تفا��يل..."
                  className="h-12 rounded-xl border-slate-200 text-right"
                />
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-2 pb-8 px-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-95",
                type === 'expense'
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
              )}
            >
              {isLoading ? 'جاري الحفظ...' : (type === 'expense' ? 'تسجيل المصروف' : 'إضافة الرصيد')}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
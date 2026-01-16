import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { cn } from '@/lib/utils';
export function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = useAppStore(s => s.wallets.find(w => w.id === id));
  const transactions = useAppStore(s => s.transactions.filter(t => t.walletId === id).sort((a, b) => b.date - a.date));
  const categories = useAppStore(s => s.categories);
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
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
  const getCategoryName = (catId: string) => {
    if (catId === 'deposit_sys') return 'تغ��ية رصيد';
    return categories.find(c => c.id === catId)?.name || 'غير محد��';
  };
  return (
    <RtlWrapper>
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full hover:bg-slate-100">
          <ArrowRight className="w-6 h-6 text-slate-600" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">{wallet.name}</h1>
          <p className="text-xs text-slate-500">تفاصيل العمليا��</p>
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
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">الرصيد الحالي</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold tabular-nums">{wallet.balance.toLocaleString()}</h2>
              <span className="text-blue-300 font-medium">ر.س</span>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 -z-0"></div>
        </div>
      </div>
      {/* Transactions List */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 pt-8 pb-safe overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-6">سجل العمليات</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400 text-sm">لا توجد عمليات مسجلة لهذه المحفظة</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-start gap-4 group">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                  tx.type === 'expense' 
                    ? "bg-red-50 text-red-500 group-hover:bg-red-100" 
                    : "bg-blue-50 text-blue-500 group-hover:bg-blue-100"
                )}>
                  {tx.type === 'expense' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 truncate">{getCategoryName(tx.categoryId)}</h4>
                    <span className={cn(
                      "font-bold tabular-nums whitespace-nowrap",
                      tx.type === 'expense' ? "text-red-600" : "text-blue-600"
                    )}>
                      {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{format(tx.date, "d MMM, h:mm a", { locale: arSA })}</span>
                    </div>
                    {tx.notes && <span className="truncate max-w-[120px]">{tx.notes}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RtlWrapper>
  );
}
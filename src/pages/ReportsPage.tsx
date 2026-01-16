import { useState, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Share2, Download, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format, isSameDay, isSameWeek, isSameMonth, startOfDay, endOfDay } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
type TimeRange = 'today' | 'week' | 'month' | 'all';
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];
export function ReportsPage() {
  const transactions = useAppStore(s => s.transactions);
  const categories = useAppStore(s => s.categories);
  const wallets = useAppStore(s => s.wallets);
  const [range, setRange] = useState<TimeRange>('today');
  const reportRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  // Filter transactions based on range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const date = new Date(t.date);
      if (range === 'today') return isSameDay(date, now);
      if (range === 'week') return isSameWeek(date, now, { weekStartsOn: 6 }); // Week starts on Saturday in many Arab countries
      if (range === 'month') return isSameMonth(date, now);
      return true;
    }).sort((a, b) => b.date - a.date);
  }, [transactions, range]);
  // Calculate summaries
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'deposit')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);
  // Prepare chart data
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.categoryId) || 0;
        categoryMap.set(t.categoryId, current + t.amount);
      });
    return Array.from(categoryMap.entries())
      .map(([id, value]) => ({
        name: categories.find(c => c.id === id)?.name || 'غير محدد',
        value
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories]);
  const handleShare = async () => {
    if (!reportRef.current) return;
    setIsSharing(true);
    try {
      // Small delay to ensure UI is ready for capture
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(reportRef.current, { 
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      // Convert data URL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `report-${format(new Date(), 'yyyy-MM-dd')}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'تقرير المصروفات',
          text: `تقرير المصروفات - ${format(new Date(), 'PPP', { locale: arSA })}`,
          files: [file]
        });
        toast.success('تمت المشا��كة بنجاح');
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.download = `report-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('تم تحميل ��لتقرير كصورة');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('��شل مشاركة التقرير');
    } finally {
      setIsSharing(false);
    }
  };
  const getCategoryName = (id: string) => {
    if (id === 'deposit_sys') return 'تغذية رصيد';
    return categories.find(c => c.id === id)?.name || 'غير محدد';
  };
  const getWalletName = (id: string) => {
    return wallets.find(w => w.id === id)?.name || 'محفظة محذوفة';
  };
  return (
    <RtlWrapper>
      <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">التقارير</h1>
          <p className="text-sm text-slate-500">ملخص العمليات المالية</p>
        </div>
        <Button 
          onClick={handleShare} 
          disabled={isSharing}
          size="sm" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          {isSharing ? 'جاري المعالجة...' : (
            <>
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </>
          )}
        </Button>
      </header>
      {/* Filters */}
      <div className="px-6 mb-4">
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'today', label: '��ليوم' },
            { id: 'week', label: 'الأسبوع' },
            { id: 'month', label: 'الش��ر' },
            { id: 'all', label: 'الكل' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRange(tab.id as TimeRange)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                range === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Report Content Area (Capturable) */}
      <div className="flex-1 overflow-y-auto px-6 pb-24" ref={reportRef}>
        <div className="bg-white dark:bg-slate-900 pb-8"> {/* Wrapper for clean capture background */}
          {/* Date Header (Visible only in capture usually, but good to show always) */}
          <div className="mb-6 text-center">
            <p className="text-slate-400 text-xs">الفترة</p>
            <p className="text-slate-900 font-bold">
              {range === 'all' ? 'جميع العمليات' : format(new Date(), 'PPP', { locale: arSA })}
            </p>
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-600 mb-1">الدخل</p>
              <p className="text-lg font-bold text-emerald-700 tabular-nums">{summary.income.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
              <p className="text-xs text-red-600 mb-1">المصروفات</p>
              <p className="text-lg font-bold text-red-700 tabular-nums">{summary.expense.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-600 mb-1">الصافي</p>
              <p className={cn(
                "text-lg font-bold tabular-nums",
                summary.net >= 0 ? "text-slate-900" : "text-red-600"
              )}>
                {summary.net.toLocaleString()}
              </p>
            </div>
          </div>
          {/* Chart */}
          {chartData.length > 0 && (
            <div className="mb-8 h-64 w-full">
              <h3 className="text-sm font-bold text-slate-900 mb-4">توزيع المصروفات</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} ر.س`, 'المبلغ']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Transactions Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">تفاصيل العمليات</h3>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 text-sm">لا توجد عمليات في هذه الفترة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "w-2 h-10 rounded-full shrink-0",
                        tx.type === 'expense' ? "bg-red-500" : "bg-emerald-500"
                      )} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{getCategoryName(tx.categoryId)}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {getWalletName(tx.walletId)} • {format(tx.date, 'h:mm a', { locale: arSA })}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className={cn(
                        "font-bold text-sm tabular-nums",
                        tx.type === 'expense' ? "text-red-600" : "text-emerald-600"
                      )}>
                        {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Footer for Report */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">تم إنشاء التقرير بواسطة تطبيق مُحافظ</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </RtlWrapper>
  );
}
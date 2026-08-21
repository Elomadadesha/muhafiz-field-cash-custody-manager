import { useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CURRENCIES } from '@/lib/db';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Filter, Save, Share2, Search, ChevronDown, TrendingUp, WalletCards } from 'lucide-react';
import { format, isSameDay, isSameWeek, isSameMonth, startOfDay, endOfDay } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/app';
import { generateDailyTreasuryReport } from '@/lib/excel';

type TimeRange = 'today' | 'week' | 'month' | 'all' | 'custom';
type ReportTab = 'categories' | 'treasury' | 'analysis' | 'general';
const COLORS = ['#3b82f6', '#00c78b', '#ff9f00', '#ff6b78', '#8b5cf6', '#22d3ee', '#f472b6'];

export function ReportsPage() {
  const transactions = useAppStore(s => s.transactions);
  const categories = useAppStore(s => s.categories);
  const wallets = useAppStore(s => s.wallets);
  const settings = useAppStore(s => s.settings);
  const currency = CURRENCIES[settings.currency];
  const [range, setRange] = useState<TimeRange>('today');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [activeTab, setActiveTab] = useState<ReportTab>('general');
  const [advanced, setAdvanced] = useState(false);
  const [customFrom, setCustomFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customTo, setCustomTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSharing, setIsSharing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      if (selectedWallet !== 'all' && tx.walletId !== selectedWallet) return false;
      const date = new Date(tx.date);
      if (range === 'today') return isSameDay(date, now);
      if (range === 'week') return isSameWeek(date, now, { weekStartsOn: 6 });
      if (range === 'month') return isSameMonth(date, now);
      if (range === 'custom') {
        return date >= startOfDay(new Date(`${customFrom}T00:00:00`)) && date <= endOfDay(new Date(`${customTo}T00:00:00`));
      }
      return true;
    }).sort((a, b) => b.date - a.date);
  }, [transactions, selectedWallet, range, customFrom, customTo]);

  const summary = useMemo(() => {
    const income = filtered.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(t => t.type === 'expense').forEach(t => {
      const id = t.categoryId === 'custom' ? `custom:${t.customCategoryName || 'مصروف مخصص'}` : t.categoryId;
      map.set(id, (map.get(id) || 0) + t.amount);
    });
    return [...map.entries()].map(([id, value]) => ({
      name: id.startsWith('custom:') ? id.slice(7) : categories.find(c => c.id === id)?.name || 'غير محدد',
      value,
    })).sort((a, b) => b.value - a.value);
  }, [filtered, categories]);

  const treasuryData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    filtered.forEach(tx => {
      const key = format(tx.date, 'yyyy-MM-dd');
      const item = map.get(key) || { income: 0, expense: 0 };
      if (tx.type === 'deposit') item.income += tx.amount; else item.expense += tx.amount;
      map.set(key, item);
    });
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([date, values]) => ({
      date: format(new Date(`${date}T12:00:00`), 'dd MMMM yyyy', { locale: arSA }),
      shortDate: format(new Date(`${date}T12:00:00`), 'dd/MM'),
      ...values,
      net: values.income - values.expense,
    }));
  }, [filtered]);

  const trendData = useMemo(() => treasuryData.slice().reverse().slice(-7), [treasuryData]);
  const walletName = selectedWallet === 'all' ? 'جميع العُهد' : wallets.find(w => w.id === selectedWallet)?.name || 'عُهدة محددة';
  const periodLabel = range === 'today' ? 'اليوم' : range === 'week' ? 'هذا الأسبوع' : range === 'month' ? 'هذا الشهر' : range === 'custom' ? `${customFrom} إلى ${customTo}` : 'جميع العمليات';
  const amount = (value: number) => `${value.toLocaleString('ar-EG')} ${currency.symbol}`;
  const categoryName = (tx: Transaction) => tx.categoryId === 'deposit_sys' ? 'إضافة رصيد' : tx.categoryId === 'custom' ? tx.customCategoryName || 'مصروف مخصص' : categories.find(c => c.id === tx.categoryId)?.name || 'غير محدد';
  const walletFor = (id: string) => wallets.find(w => w.id === id)?.name || 'محفظة محذوفة';

  const reportText = () => `تقرير محافظ العُهَد\nالفترة: ${periodLabel}\nالمحفظة: ${walletName}\nالدخل: ${amount(summary.income)}\nالمصروفات: ${amount(summary.expense)}\nالصافي: ${amount(summary.net)}`;
  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (!reportRef.current) throw new Error('report unavailable');
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, backgroundColor: '#0d162b', pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `muhafiz-report-${Date.now()}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'تقرير محافظ العُهَد', text: reportText(), files: [file] });
      else { const link = document.createElement('a'); link.href = dataUrl; link.download = file.name; link.click(); toast.success('تم حفظ التقرير كصورة'); }
    } catch { if (navigator.share) await navigator.share({ title: 'تقرير محافظ العُهَد', text: reportText() }); else { await navigator.clipboard?.writeText(reportText()); toast.success('تم نسخ التقرير'); } }
    finally { setIsSharing(false); }
  };
  const handleExport = () => { try { generateDailyTreasuryReport(filtered, wallets, range); toast.success('تم تصدير التقرير بصيغة CSV المتوافقة مع Excel'); } catch { toast.error('تعذر تصدير التقرير'); } };

  return (
    <RtlWrapper>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d162b]/95 px-5 pb-4 pt-8 backdrop-blur">
        <div><h1 className="text-2xl font-extrabold text-white">التقارير</h1><p className="text-sm text-slate-400">تحليل وإحصائيات المحافظ والعُهَد</p></div>
        <Button onClick={activeTab === 'general' ? handleShare : handleExport} disabled={isSharing} className="gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500">{activeTab === 'general' ? <><Share2 className="h-4 w-4" />مشاركة</> : <><FileSpreadsheet className="h-4 w-4" />تصدير CSV</>}</Button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#1b2940] text-slate-300"><Filter className="h-5 w-5" /></div>
          <div className="relative flex-1"><select value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)} className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-[#1b2940] px-4 pl-10 text-right text-sm font-semibold text-white outline-none"><option value="all">جميع العُهد</option>{wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select><ChevronDown className="pointer-events-none absolute left-4 top-3 h-5 w-5 text-slate-400" /></div>
          <Button onClick={handleExport} size="icon" variant="outline" className="h-11 w-11 rounded-2xl border-white/10 bg-[#1b2940] text-slate-300"><Save className="h-5 w-5" /></Button>
        </div>

        <div className="mb-3 grid grid-cols-5 gap-1 rounded-2xl bg-[#1b2940] p-1">
          {[['today','اليوم'],['week','الأسبوع'],['month','الشهر'],['all','الكل'],['custom','مخصص']].map(([id, label]) => <button key={id} onClick={() => setRange(id as TimeRange)} className={cn('rounded-xl px-2 py-2 text-xs font-bold transition', range === id ? 'bg-[#3a4a60] text-white shadow' : 'text-slate-400')}>{label}</button>)}
        </div>
        <button onClick={() => setAdvanced(v => !v)} className="mb-4 flex w-full items-center justify-end gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-400"><Search className="h-4 w-4" /> بحث متقدم <span className="mr-auto text-blue-400">{advanced ? 'إخفاء' : 'فتح'}</span></button>
        {advanced && <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#18243a] p-4"><label className="text-xs text-slate-400">من<input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); setRange('custom'); }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d162b] p-2 text-white" /></label><label className="text-xs text-slate-400">إلى<input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); setRange('custom'); }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d162b] p-2 text-white" /></label></div>}

        <div className="mb-6 grid grid-cols-4 gap-1 rounded-3xl bg-[#1b2940] p-2">
          {([['categories','تصنيفات'],['treasury','خزينة'],['analysis','تحليل'],['general','عام']] as [ReportTab,string][]).map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} className={cn('rounded-2xl py-3 text-sm font-bold', activeTab === id ? 'bg-[#0d162b] text-white shadow' : 'text-slate-400')}>{label}</button>)}
        </div>

        <section ref={reportRef} className="space-y-5">
          <div className="text-center"><p className="text-sm text-slate-400">ملخص الفترة</p><h2 className="text-xl font-extrabold text-white">{periodLabel}</h2><p className="text-xs text-blue-400">{walletName}</p></div>
          {activeTab === 'general' && <>
            <div className="glass-card grid grid-cols-3 gap-2 p-4 text-center"><div><p className="text-xs text-slate-400">الصافي</p><strong className={cn('text-lg', summary.net >= 0 ? 'text-white' : 'text-red-400')}>{amount(summary.net)}</strong></div><div className="border-x border-white/10"><p className="text-xs text-red-300">المصروفات</p><strong className="text-lg text-red-400">{amount(summary.expense)}</strong></div><div><p className="text-xs text-blue-300">الدخل</p><strong className="text-lg text-blue-400">{amount(summary.income)}</strong></div></div>
            <div className="glass-card p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold text-white">اتجاه المصروفات</h3><TrendingUp className="h-5 w-5 text-blue-400" /></div><p className="mb-3 text-xs text-slate-400">آخر 7 أيام</p>{trendData.length ? <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><CartesianGrid stroke="#2b3a50" vertical={false} /><XAxis dataKey="shortDate" stroke="#94a3b8" tick={{ fontSize: 10 }} /><YAxis hide /><Tooltip contentStyle={{ background: '#18243a', border: '1px solid #334155', borderRadius: 12 }} /><Bar dataKey="expense" fill="#3b82f6" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div> : <p className="py-12 text-center text-sm text-slate-500">ابدأ بتسجيل مصروفاتك اليومية لتظهر التحليلات هنا</p>}</div>
          </>}
          {activeTab === 'analysis' && <div className="glass-card p-4"><h3 className="mb-4 text-lg font-bold text-white">تحليل المصروفات</h3>{categoryData.length ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={4}>{categoryData.map((item, i) => <Cell key={item.name} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#18243a', border: '1px solid #334155', borderRadius: 12 }} /><Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} /></PieChart></ResponsiveContainer></div> : <p className="py-16 text-center text-slate-400">لا توجد مصروفات في هذه الفترة</p>}</div>}
          {activeTab === 'categories' && <div className="space-y-3">{categoryData.length ? categoryData.map((item, i) => <div key={item.name} className="glass-card p-4"><div className="mb-2 flex items-center justify-between"><span className="font-semibold text-white">{item.name}</span><span className="font-bold text-blue-400">{amount(item.value)}</span></div><div className="h-2 rounded-full bg-[#0d162b]"><div className="h-full rounded-full" style={{ width: `${summary.expense ? (item.value / summary.expense) * 100 : 0}%`, background: COLORS[i % COLORS.length] }} /></div></div>) : <div className="glass-card py-16 text-center text-slate-400">لا توجد تصنيفات في هذه الفترة</div>}</div>}
          {activeTab === 'treasury' && <div className="glass-card overflow-hidden"><div className="grid grid-cols-4 border-b border-white/10 bg-[#1b2940] p-3 text-center text-xs font-bold text-slate-300"><span>التاريخ</span><span>الدخل</span><span>الصرف</span><span>الصافي</span></div>{treasuryData.length ? treasuryData.map(day => <div key={day.date} className="grid grid-cols-4 border-b border-white/5 p-4 text-center text-xs"><span className="text-right text-slate-300">{day.date}</span><span className="text-blue-400">{day.income.toLocaleString()}</span><span className="text-red-400">{day.expense.toLocaleString()}</span><span className={day.net >= 0 ? 'text-emerald-400' : 'text-red-400'}>{day.net.toLocaleString()}</span></div>) : <p className="py-16 text-center text-slate-400">لا توجد بيانات للعرض</p>}</div>}

          {(activeTab === 'general' || activeTab === 'categories') && <div className="glass-card p-4"><div className="mb-4 flex items-center gap-2"><WalletCards className="h-5 w-5 text-blue-400" /><h3 className="text-lg font-bold text-white">تفاصيل العمليات</h3></div>{filtered.length ? <div className="space-y-2">{filtered.slice(0, 30).map(tx => <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-[#18243a] p-3"><div className="flex min-w-0 items-center gap-3"><span className={cn('h-10 w-1 rounded-full', tx.type === 'expense' ? 'bg-red-400' : 'bg-blue-400')} /><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{categoryName(tx)}</p><p className="truncate text-xs text-slate-400">{walletFor(tx.walletId)} • {format(tx.date, 'dd/MM h:mm a', { locale: arSA })}</p></div></div><strong className={cn('text-sm', tx.type === 'expense' ? 'text-red-400' : 'text-blue-400')}>{tx.type === 'expense' ? '-' : '+'}{amount(tx.amount)}</strong></div>)}</div> : <p className="py-10 text-center text-slate-400">لا توجد عمليات في هذه الفترة</p>}</div>}
        </section>
      </main>
      <BottomNav />
    </RtlWrapper>
  );
}

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Transaction, Wallet } from '@/types/app';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Share2, Download, Receipt, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { CURRENCIES } from '@/lib/db';
import { useAppStore } from '@/lib/store';
interface TransactionReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  wallet: Wallet | undefined;
  categoryName: string;
}
export function TransactionReceipt({
  open,
  onOpenChange,
  transaction,
  wallet,
  categoryName
}: TransactionReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const settings = useAppStore(s => s.settings);
  const currency = CURRENCIES[settings.currency];
  if (!transaction) return null;
  const handleShare = async () => {
    if (!receiptRef.current) return;
    setIsSharing(true);
    try {
      // Small delay to ensure rendering is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc', // slate-50
        pixelRatio: 3, // Higher quality
        style: {
          fontFamily: "'Cairo', sans-serif",
        }
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `receipt-${transaction.id.slice(0, 8)}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'إيصال عملية مالية',
          text: `إيصال عملية بقيمة ${transaction.amount} ${currency.symbol} - ${categoryName}`,
          files: [file]
        });
        toast.success('تمت المشاركة بنجاح');
      } else {
        const link = document.createElement('a');
        link.download = `receipt-${transaction.id.slice(0, 8)}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('تم تحميل الإيصال كصورة');
      }
    } catch (error) {
      console.error('Receipt generation failed:', error);
      toast.error('فشل إنشاء الإيصال');
    } finally {
      setIsSharing(false);
    }
  };
  const isExpense = transaction.type === 'expense';
  const typeLabel = isExpense ? 'سند صرف' : (transaction.type === 'deposit' ? 'سند قبض' : 'تحويل مالي');
  const colorClass = isExpense ? 'text-red-600' : (transaction.type === 'deposit' ? 'text-blue-600' : 'text-amber-600');
  const bgClass = isExpense ? 'bg-red-50' : (transaction.type === 'deposit' ? 'bg-blue-50' : 'bg-amber-50');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-slate-100 dark:bg-slate-900" dir="rtl">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5 text-slate-500" />
              <span>إيصال رقمي</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              نسخة رقمية للعملية المالية
            </DialogDescription>
          </DialogHeader>
          {/* Receipt Container - This is what gets captured */}
          <div
            ref={receiptRef}
            className="bg-white relative rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Top Pattern */}
            <div className="h-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500" />
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <Logo size="sm" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Abu MaWaDa</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>عملية ناجحة</span>
                </div>
              </div>
              {/* Amount */}
              <div className="text-center py-4 border-y border-dashed border-slate-200">
                <p className="text-slate-400 text-xs mb-1">{typeLabel}</p>
                <div className="flex items-center justify-center gap-1">
                  <span className={cn("text-4xl font-bold tracking-tight tabular-nums", colorClass)}>
                    {transaction.amount.toLocaleString()}
                  </span>
                  <span className="text-slate-400 font-medium text-lg">{currency.symbol}</span>
                </div>
              </div>
              {/* Details Grid */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">التاريخ</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {format(transaction.date, 'PPP', { locale: arSA })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الوقت</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {format(transaction.date, 'h:mm a', { locale: arSA })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">المحفظة</span>
                  <span className="font-medium text-slate-700">{wallet?.name || 'غي�� معروف'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">البند / التصنيف</span>
                  <span className="font-medium text-slate-700">{categoryName}</span>
                </div>
                {transaction.notes && (
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <span className="text-slate-400 block mb-1 text-xs">ملاحظات</span>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded-lg text-xs leading-relaxed">
                      {transaction.notes}
                    </p>
                  </div>
                )}
              </div>
              {/* Footer ID */}
              <div className="pt-4 text-center">
                <p className="text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                  REF: {transaction.id.split('-')[0]}
                </p>
              </div>
            </div>
            {/* Bottom Sawtooth Pattern (CSS Trick) */}
            <div className="relative h-4 bg-slate-100 dark:bg-slate-900 -mt-[1px]">
               <div className="absolute top-0 left-0 w-full h-full" 
                    style={{
                      background: 'linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)',
                      backgroundSize: '12px 24px',
                      backgroundPosition: '0 -12px',
                      transform: 'rotate(180deg)'
                    }} 
               />
            </div>
          </div>
          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button 
              onClick={handleShare} 
              disabled={isSharing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-lg shadow-blue-600/20"
            >
              {isSharing ? 'جاري المعالجة...' : 'مشاركة الإيصال'}
              <Share2 className="w-4 h-4 mr-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-12 w-12 rounded-xl border-slate-200"
            >
              <Download className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
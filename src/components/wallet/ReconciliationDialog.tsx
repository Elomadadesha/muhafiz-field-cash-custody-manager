import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Wallet } from '@/types/app';
import { Handshake, AlertTriangle } from 'lucide-react';
interface ReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: Wallet;
}
export function ReconciliationDialog({ open, onOpenChange, wallet }: ReconciliationDialogProps) {
  const reconcileWallet = useAppStore(s => s.reconcileWallet);
  const [accountantName, setAccountantName] = useState('');
  const [newBalance, setNewBalance] = useState('0');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleReconcile = async () => {
    const balance = parseFloat(newBalance);
    if (isNaN(balance)) {
      toast.error('الر��اء إدخال رصيد صحيح');
      return;
    }
    setIsLoading(true);
    try {
      await reconcileWallet(wallet.id, accountantName, balance, notes);
      toast.success('تمت تصفية العُهدة بنجاح');
      onOpenChange(false);
      // Reset form
      setAccountantName('');
      setNewBalance('0');
      setNotes('');
    } catch (error) {
      toast.error('فشل عملية التصفية');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Handshake className="w-5 h-5 text-blue-600" />
            تصفية العُهدة مع المحاسب
          </DialogTitle>
          <DialogDescription className="text-right text-slate-500">
            سيتم تسجيل الر��يد الحالي ({wallet.balance.toLocaleString()}) كرصيد تصفية، وتحديث رصيد المحف��ة للقيمة الجديدة.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold mb-1">تنبيه هام</p>
              <p>هذه العملية ستقوم بإنشاء معامل�� "تصفية" آلية لضبط الرصيد. لا يمكن التراجع عن هذه العملية بسهولة.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-right block">اسم المحاسب (اختياري)</Label>
            <Input
              value={accountantName}
              onChange={(e) => setAccountantName(e.target.value)}
              placeholder="مثال: أ. محمد أحمد"
              className="text-right h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-right block">الرصيد الجديد (بعد التصفية)</Label>
            <Input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="0.00"
              className="text-center h-12 rounded-xl text-lg font-bold"
            />
            <p className="text-[10px] text-slate-400 mr-1">اتركه 0 إذا قمت بتسليم كامل المبلغ.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-right block">ملاحظات</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل إضافية..."
              className="text-right rounded-xl min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleReconcile}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl"
          >
            {isLoading ? 'جاري ��لتصفية...' : 'تأكيد التصفية'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
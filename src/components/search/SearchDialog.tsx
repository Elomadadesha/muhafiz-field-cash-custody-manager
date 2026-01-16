import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Wallet, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCIES } from '@/lib/db';
interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const transactions = useAppStore(s => s.transactions);
  const wallets = useAppStore(s => s.wallets);
  const categories = useAppStore(s => s.categories);
  const settings = useAppStore(s => s.settings);
  const currency = CURRENCIES[settings.currency];
  const [query, setQuery] = useState('');
  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);
  const getCategoryName = (categoryId: string, customName?: string) => {
    if (categoryId === 'deposit_sys') return 'تغذية رصيد';
    if (categoryId === 'custom') return customName || 'مصروف مخصص';
    return categories.find(c => c.id === categoryId)?.name || 'غير محدد';
  };
  const filteredTransactions = transactions.filter(tx => {
    if (!query) return false;
    const q = query.toLowerCase();
    const amountStr = tx.amount.toString();
    const noteStr = (tx.notes || '').toLowerCase();
    const categoryName = getCategoryName(tx.categoryId, tx.customCategoryName).toLowerCase();
    return amountStr.includes(q) || noteStr.includes(q) || categoryName.includes(q);
  }).slice(0, 20); // Limit results for performance
  const handleSelect = (walletId: string) => {
    navigate(`/wallet/${walletId}`);
    onOpenChange(false);
  };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div dir="rtl">
        <CommandInput 
          placeholder="ابحث عن عملية (المبلغ، الملاحظات، البند)..." 
          value={query}
          onValueChange={setQuery}
          className="text-right"
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty className="py-6 text-center text-sm text-slate-500">
            لا توجد نتائج مطابقة
          </CommandEmpty>
          {filteredTransactions.length > 0 && (
            <CommandGroup heading="العمليات">
              {filteredTransactions.map(tx => {
                const wallet = wallets.find(w => w.id === tx.walletId);
                const categoryName = getCategoryName(tx.categoryId, tx.customCategoryName);
                return (
                  <CommandItem
                    key={tx.id}
                    value={`${tx.amount} ${tx.notes} ${categoryName}`}
                    onSelect={() => handleSelect(tx.walletId)}
                    className="flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        tx.type === 'expense' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      )}>
                        {tx.type === 'expense' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{categoryName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            {wallet?.name}
                          </span>
                          <span>���</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(tx.date, 'd MMM', { locale: arSA })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className={cn(
                        "font-bold text-sm tabular-nums",
                        tx.type === 'expense' ? "text-red-600" : "text-blue-600"
                      )}>
                        {tx.amount.toLocaleString()} {currency.symbol}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}
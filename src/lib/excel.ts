import { Transaction, Wallet } from '@/types/app';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

function csvCell(value: string | number) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export function generateDailyTreasuryReport(
  transactions: Transaction[],
  wallets: Wallet[],
  _dateRange: 'today' | 'week' | 'month' | 'all'
) {
  const grouped = new Map<string, Map<string, { income: number; expense: number }>>();
  for (const tx of transactions) {
    const dateKey = format(tx.date, 'yyyy-MM-dd');
    const byWallet = grouped.get(dateKey) || new Map<string, { income: number; expense: number }>();
    const stats = byWallet.get(tx.walletId) || { income: 0, expense: 0 };
    if (tx.type === 'deposit') stats.income += tx.amount;
    else stats.expense += tx.amount;
    byWallet.set(tx.walletId, stats);
    grouped.set(dateKey, byWallet);
  }

  const rows: (string | number)[][] = [['التاريخ', 'المحفظة', 'الدخل', 'المصروفات', 'الصافي']];
  [...grouped.keys()].sort().reverse().forEach(dateKey => {
    grouped.get(dateKey)!.forEach((stats, walletId) => {
      rows.push([
        format(new Date(`${dateKey}T12:00:00`), 'PPP', { locale: arSA }),
        wallets.find(w => w.id === walletId)?.name || 'محفظة غير معروفة',
        stats.income,
        stats.expense,
        stats.income - stats.expense,
      ]);
    });
  });
  if (rows.length === 1) rows.push(['-', '-', 0, 0, 0]);

  const csv = '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `treasury-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

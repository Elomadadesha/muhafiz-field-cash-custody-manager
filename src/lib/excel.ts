import * as XLSX from 'xlsx';
import { Transaction, Wallet } from '@/types/app';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
export function generateDailyTreasuryReport(
  transactions: Transaction[],
  wallets: Wallet[],
  dateRange: 'today' | 'week' | 'month' | 'all'
) {
  // 1. Prepare Data
  // Group by Date -> Wallet
  const groupedData = new Map<string, Map<string, { income: number; expense: number }>>();
  // Filter transactions based on date range if needed (though usually passed filtered)
  // We assume 'transactions' passed here are already filtered by the view, 
  // but we can double check or just process all passed.
  transactions.forEach(tx => {
    const dateKey = format(tx.date, 'yyyy-MM-dd');
    const walletId = tx.walletId;
    if (!groupedData.has(dateKey)) {
      groupedData.set(dateKey, new Map());
    }
    const dateGroup = groupedData.get(dateKey)!;
    if (!dateGroup.has(walletId)) {
      dateGroup.set(walletId, { income: 0, expense: 0 });
    }
    const walletStats = dateGroup.get(walletId)!;
    if (tx.type === 'deposit') {
      walletStats.income += tx.amount;
    } else {
      walletStats.expense += tx.amount;
    }
  });
  // 2. Flatten for Excel
  const rows: any[] = [];
  // Sort dates descending
  const sortedDates = Array.from(groupedData.keys()).sort().reverse();
  sortedDates.forEach(dateKey => {
    const dateGroup = groupedData.get(dateKey)!;
    const formattedDate = format(new Date(dateKey), 'PPP', { locale: arSA });
    dateGroup.forEach((stats, walletId) => {
      const wallet = wallets.find(w => w.id === walletId);
      const walletName = wallet ? wallet.name : 'محفظة غير معروفة';
      rows.push({
        'التاريخ': formattedDate,
        'المحفظة': walletName,
        'مدين (��خل)': stats.income,
        'دائن (صرف)': stats.expense,
        'الص��في': stats.income - stats.expense
      });
    });
  });
  if (rows.length === 0) {
    rows.push({
      'التاريخ': '-',
      'المحفظة': '-',
      'مدين (دخل)': 0,
      'دائن (صرف)': 0,
      'الصافي': 0
    });
  }
  // 3. Generate Sheet
  const ws = XLSX.utils.json_to_sheet(rows);
  // Adjust column widths
  const wscols = [
    { wch: 20 }, // Date
    { wch: 20 }, // Wallet
    { wch: 15 }, // Income
    { wch: 15 }, // Expense
    { wch: 15 }, // Net
  ];
  ws['!cols'] = wscols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "تقرير الخزينة اليومية");
  // 4. Download
  const fileName = `treasury-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
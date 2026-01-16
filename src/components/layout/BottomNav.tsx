import { Home, PlusCircle, FileText, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const isActive = (p: string) => path === p;
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 h-20 z-50">
      <div className="flex items-center justify-between h-full pb-2 relative">
        <Link to="/dashboard" className={cn("flex flex-col items-center gap-1 transition-colors w-16", isActive('/dashboard') ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">الرئيسية</span>
        </Link>
        <Link to="/reports" className={cn("flex flex-col items-center gap-1 transition-colors w-16", isActive('/reports') ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
          <FileText className="w-6 h-6" />
          <span className="text-xs font-medium">التقارير</span>
        </Link>
        {/* FAB - Perfectly Centered */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
          <button
            onClick={() => openTransactionDrawer()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg shadow-blue-500/30 transition-transform active:scale-95 border-4 border-slate-50 dark:border-slate-950"
          >
            <PlusCircle className="w-8 h-8" />
          </button>
        </div>
        {/* Spacer for FAB */}
        <div className="w-16"></div>
        <Link to="/settings" className={cn("flex flex-col items-center gap-1 transition-colors w-16", isActive('/settings') ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
}
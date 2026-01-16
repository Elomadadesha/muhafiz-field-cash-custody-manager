import { Home, PlusCircle, FileText, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const isActive = (p: string) => path === p;
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 h-20 z-50">
      <div className="flex items-center justify-between h-full pb-2">
        <Link to="/dashboard" className={cn("flex flex-col items-center gap-1 transition-colors", isActive('/dashboard') ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">الرئيسية</span>
        </Link>
        <Link to="/reports" className={cn("flex flex-col items-center gap-1 transition-colors", isActive('/reports') ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
          <FileText className="w-6 h-6" />
          <span className="text-xs font-medium">التقارير</span>
        </Link>
        {/* FAB Placeholder - Center */}
        <div className="relative -top-6">
          <button className="bg-primary hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95">
            <PlusCircle className="w-8 h-8" />
          </button>
        </div>
        <Link to="/settings" className={cn("flex flex-col items-center gap-1 transition-colors", isActive('/settings') ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
}
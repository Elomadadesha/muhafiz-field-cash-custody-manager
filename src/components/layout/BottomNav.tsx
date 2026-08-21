import type { ReactNode } from 'react';
import { Home, PlusCircle, FileText, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

function NavItem({ to, active, label, children }: { to: string; active: boolean; label: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-w-0 flex-col items-center justify-end gap-1 rounded-xl px-1 py-1 text-center transition-colors',
        active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">{children}</span>
      <span className="w-full truncate text-[11px] font-semibold leading-5 sm:text-xs">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const location = useLocation();
  const openTransactionDrawer = useAppStore(s => s.openTransactionDrawer);
  return (
    <nav className="sticky bottom-0 z-50 h-[88px] shrink-0 border-t border-white/10 bg-[#0d162b]/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(2,8,23,0.28)] backdrop-blur-md" dir="rtl">
      <div className="relative mx-auto grid h-full max-w-md grid-cols-4 items-end gap-1">
        <NavItem to="/dashboard" active={location.pathname === '/dashboard'} label="الرئيسية"><Home className="h-6 w-6" /></NavItem>
        <NavItem to="/reports" active={location.pathname === '/reports'} label="التقارير"><FileText className="h-6 w-6" /></NavItem>
        <div aria-hidden="true" className="h-full" />
        <NavItem to="/settings" active={location.pathname === '/settings'} label="الإعدادات"><Settings className="h-6 w-6" /></NavItem>
        <button
          type="button"
          aria-label="إضافة عملية جديدة"
          onClick={() => openTransactionDrawer()}
          className="absolute bottom-5 left-1/2 flex h-[66px] w-[66px] -translate-x-1/2 items-center justify-center rounded-full border-[5px] border-[#0d162b] bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.45)] transition-transform hover:bg-blue-500 active:scale-95"
        >
          <PlusCircle className="h-9 w-9" strokeWidth={1.8} />
        </button>
      </div>
    </nav>
  );
}

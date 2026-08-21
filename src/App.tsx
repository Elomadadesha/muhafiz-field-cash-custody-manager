import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WalletDetailPage } from '@/pages/WalletDetailPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useAppStore } from '@/lib/store';
import { Toaster, toast } from 'sonner';
import { TransactionDrawer } from '@/components/transaction/TransactionDrawer';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { useAutoLock } from '@/hooks/use-auto-lock';
import { isSecureContextAvailable } from '@/lib/security';
import { App as CapacitorApp } from '@capacitor/app';
// Auth Guard
function ProtectedRoute() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const isLocked = useAppStore(s => s.isLocked);
  // Hook to monitor inactivity and lock app
  useAutoLock();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isLocked) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Outlet />
      <TransactionDrawer />
    </>
  );
}
// Public Route
function PublicRoute() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const isLocked = useAppStore(s => s.isLocked);
  if (isAuthenticated && !isLocked) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/wallet/:id',
        element: <WalletDetailPage />,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
export function App() {
  const isDrawerOpen = useAppStore(s => s.isTransactionDrawerOpen);
  const closeDrawer = useAppStore(s => s.closeTransactionDrawer);

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | undefined;
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (useAppStore.getState().isTransactionDrawerOpen) {
        closeDrawer();
        return;
      }
      if (canGoBack) router.navigate(-1);
      else CapacitorApp.exitApp();
    }).then(listener => { handle = listener; });
    return () => { handle?.remove(); };
  }, [closeDrawer, isDrawerOpen]);

  useEffect(() => {
    // Check for security context on mount
    if (!isSecureContextAvailable()) {
      toast.warning(
        "ميزات الأان غير متوفرة. يرجى استخدام متصفح حديث واتصال آمن (HTTPS).",
        { duration: 10000 }
      );
    }
  }, []);
  return (
    <>
      <RouterProvider router={router} />
      <InstallPrompt />
      <Toaster richColors position="top-center" />
    </>
  );
}
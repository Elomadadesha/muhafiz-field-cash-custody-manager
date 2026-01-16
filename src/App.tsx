import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WalletDetailPage } from '@/pages/WalletDetailPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useAppStore } from '@/lib/store';
import { Toaster } from 'sonner';
import { TransactionDrawer } from '@/components/transaction/TransactionDrawer';
import { useAutoLock } from '@/hooks/use-auto-lock';
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
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </>
  );
}
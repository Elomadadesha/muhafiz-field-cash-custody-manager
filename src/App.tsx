import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WalletDetailPage } from '@/pages/WalletDetailPage';
import { useAppStore } from '@/lib/store';
import { Toaster } from 'sonner';
import { TransactionDrawer } from '@/components/transaction/TransactionDrawer';
// Auth Guard
function ProtectedRoute() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Outlet />
      <TransactionDrawer />
    </>
  );
}
// Public Route (redirect if already logged in)
function PublicRoute() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  if (isAuthenticated) {
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
      // Placeholders for future routes
      {
        path: '/reports',
        element: <div className="p-8 text-center">صفحة التقارير (قريباً)</div>,
      },
      {
        path: '/settings',
        element: <div className="p-8 text-center">صفحة الإعدادات (قريباً)</div>,
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
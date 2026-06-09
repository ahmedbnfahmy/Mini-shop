import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({
  children,
  adminOnly = true,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="p-8 max-w-sm w-full bg-white shadow rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="mb-6">You need administrator privileges to access this dashboard.</p>
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              window.location.href = '/login';
            }}
            className="w-full bg-blue-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

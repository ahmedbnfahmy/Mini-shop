import type { ReactNode } from 'react';
import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <Link to="/login" className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <Store className="h-8 w-8 text-white" />
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}

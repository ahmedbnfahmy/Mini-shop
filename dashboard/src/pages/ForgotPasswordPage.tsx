import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/AuthLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={
        sent
          ? 'Check your inbox for a password reset link.'
          : 'Enter your email to receive a reset link.'
      }
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      }
    >
      {!sent ? (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start text-sm border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div className="mt-8 bg-green-50 text-green-700 p-4 rounded-lg flex items-start text-sm border border-green-200">
          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            If an account exists for <strong>{email}</strong>, a password reset email has been sent.
          </span>
        </div>
      )}
    </AuthLayout>
  );
}

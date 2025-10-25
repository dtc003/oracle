import React, { useState } from 'react';
import { signIn, signUp, resetPassword } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName);
        navigate('/modes');
      } else if (mode === 'signin') {
        await signIn(email, password);
        navigate('/modes');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetEmailSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Evidence Battle Simulator
          </h1>
          <p className="text-gray-300">
            Master evidence objections with AI-powered practice
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => { setMode('signin'); setError(''); setResetEmailSent(false); }}
              className={`flex-1 pb-3 font-semibold transition-colors ${
                mode === 'signin'
                  ? 'text-navy-700 border-b-2 border-navy-700'
                  : 'text-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setResetEmailSent(false); }}
              className={`flex-1 pb-3 font-semibold transition-colors ${
                mode === 'signup'
                  ? 'text-navy-700 border-b-2 border-navy-700'
                  : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'reset' ? (
            // Password Reset Form
            <div>
              <button
                onClick={() => { setMode('signin'); setResetEmailSent(false); }}
                className="text-sm text-navy-600 hover:text-navy-800 mb-4 flex items-center"
              >
                ← Back to Sign In
              </button>

              {resetEmailSent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-semibold">Check your email!</p>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent password reset instructions to {email}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Reset Password
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-700 hover:bg-navy-800 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            // Sign In / Sign Up Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    required={mode === 'signup'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-700 hover:bg-navy-800 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                {loading
                  ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'signin' ? 'Sign In' : 'Create Account')
                }
              </button>

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="w-full text-sm text-navy-600 hover:text-navy-800 mt-2"
                >
                  Forgot password?
                </button>
              )}
            </form>
          )}

          {/* Free tier notice */}
          {mode === 'signup' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Start free with unlimited AI-generated scenarios. Upgrade anytime for scripted and case-based modes.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

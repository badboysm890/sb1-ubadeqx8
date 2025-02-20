import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (type === 'login') {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData);
      }
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://framerusercontent.com/images/rLmrjpWWFPyTOfn61iSNoIOn8k.png?scale-down-to=512&lossless=1"
            alt="Smortr"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {type === 'register' && (
              <>
                <div>
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B] focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B] focus:z-10 sm:text-sm"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1E293B] hover:bg-[#2d3748] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E293B] disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                type === 'login' ? 'Sign in' : 'Register'
              )}
            </button>
          </div>

          <div className="text-sm text-center">
            {type === 'login' ? (
              <p>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-[#1E293B] hover:text-[#2d3748]"
                >
                  Register here
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#1E293B] hover:text-[#2d3748]"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
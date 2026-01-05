// Google OAuth Callback Handler Page
// Create this at: /auth/google/callback

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionKey = searchParams.get('session');

    if (!sessionKey) {
      setError('Invalid callback - no session key');
      setStatus('error');
      return;
    }

    // Exchange session key for auth data
    exchangeSession(sessionKey);
  }, [searchParams]);

  const exchangeSession = async (sessionKey) => {
    try {
      const response = await fetch('http://127.0.0.1/api/client/auth/google/exchange-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ session: sessionKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to exchange session');
      }

      if (data.data.type === 'login') {
        // Existing user - login successful
        handleLogin(data.data);
      } else if (data.data.type === 'register') {
        // New user - redirect to registration form
        handleRegister(data.data);
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleLogin = (authData) => {
    // Store token and user data
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.client));

    setStatus('success');

    // Redirect to dashboard after a brief moment
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleRegister = (googleData) => {
    // Store Google data temporarily for registration form
    sessionStorage.setItem('google_registration_data', JSON.stringify(googleData));

    // Redirect to registration form
    navigate('/auth/google/register');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Processing Google Login...</h2>
          <p className="text-gray-500 mt-2">Please wait while we authenticate you</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-700">Login Successful!</h2>
          <p className="text-gray-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GoogleCallback;

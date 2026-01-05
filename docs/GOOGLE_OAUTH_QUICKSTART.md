# Google OAuth Integration - Quick Start Guide

**Updated:** January 5, 2026  
**API Base URL:** `http://127.0.0.1/api/client`

---

## 📋 Overview

Google OAuth now uses a **session-based flow** for better security. The backend redirects to your frontend with a temporary session key that you exchange for auth data.

---

## 🔑 Required Environment Variables

Add to your frontend `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1/api/client
VITE_GOOGLE_CLIENT_ID=902638070510-tghk7knfpucvqrufccerrfppk8t4mub0.apps.googleusercontent.com
```

---

## 🚀 Implementation Steps

### Step 1: Create Google Login Button

Add this button to your login page:

```jsx
import { FaGoogle } from "react-icons/fa";

function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    try {
      // Get Google OAuth URL
      const response = await fetch('http://127.0.0.1/api/client/auth/google/redirect');
      const data = await response.json();
      
      // Redirect to Google
      window.location.href = data.data.url;
    } catch (error) {
      alert('Failed to start Google login');
    }
  };

  return (
    <button onClick={handleGoogleLogin} className="google-btn">
      <FaGoogle className="mr-2" />
      Continue with Google
    </button>
  );
}
```

---

### Step 2: Create Callback Handler Page

Create a new page at `/auth/google/callback`:

```jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const sessionKey = searchParams.get('session');
    if (!sessionKey) {
      setStatus('error');
      return;
    }
    exchangeSession(sessionKey);
  }, [searchParams]);

  const exchangeSession = async (sessionKey) => {
    try {
      const response = await fetch('http://127.0.0.1/api/client/auth/google/exchange-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionKey }),
      });

      const data = await response.json();

      if (data.data.type === 'login') {
        // Existing user - auto login
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.client));
        navigate('/dashboard');
      } else if (data.data.type === 'register') {
        // New user - go to registration
        sessionStorage.setItem('google_registration_data', JSON.stringify(data.data));
        navigate('/auth/google/register');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <div>Processing Google Login...</div>;
  }

  return <div>Authentication failed. <a href="/login">Try again</a></div>;
}

export default GoogleCallback;
```

---

### Step 3: Create Registration Page

Create a new page at `/auth/google/register`:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GoogleRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    google_id: '',
    email: '',
    full_name: '',
    avatar: '',
    phone: '',
    username: '',
    address: '',
    gender: ''
  });

  useEffect(() => {
    const googleDataStr = sessionStorage.getItem('google_registration_data');
    if (!googleDataStr) {
      navigate('/login');
      return;
    }

    const googleData = JSON.parse(googleDataStr);
    setFormData(prev => ({
      ...prev,
      google_id: googleData.google_id,
      email: googleData.email,
      full_name: googleData.full_name,
      avatar: googleData.avatar
    }));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1/api/client/auth/google/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 422) {
        setErrors(data.errors || {});
        return;
      }

      sessionStorage.removeItem('google_registration_data');
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.client));
      navigate('/dashboard');
    } catch (error) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Complete Your Registration</h2>
      
      {formData.avatar && <img src={formData.avatar} alt="Profile" />}
      
      <input
        type="text"
        value={formData.full_name}
        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
        placeholder="Full Name"
        required
      />
      {errors.full_name && <span>{errors.full_name[0]}</span>}

      <input
        type="email"
        value={formData.email}
        disabled
        readOnly
      />

      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        placeholder="+263771234567"
        required
      />
      {errors.phone && <span>{errors.phone[0]}</span>}

      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        placeholder="Username (optional)"
      />

      <input
        type="text"
        value={formData.address}
        onChange={(e) => setFormData({...formData, address: e.target.value})}
        placeholder="Address (optional)"
      />

      <select
        value={formData.gender}
        onChange={(e) => setFormData({...formData, gender: e.target.value})}
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Completing...' : 'Complete Registration'}
      </button>
    </form>
  );
}

export default GoogleRegister;
```

---

### Step 4: Add Routes

Add these routes to your React Router:

```jsx
import GoogleCallback from './pages/auth/GoogleCallback';
import GoogleRegister from './pages/auth/GoogleRegister';

function App() {
  return (
    <Routes>
      {/* ... other routes ... */}
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/auth/google/register" element={<GoogleRegister />} />
    </Routes>
  );
}
```

---

## 📊 Flow Summary

1. **User clicks "Sign in with Google"**
2. **Frontend gets Google URL** → `GET /auth/google/redirect`
3. **Redirect to Google** for authentication
4. **Google redirects back** → `/auth/google/callback?session=abc123`
5. **Frontend exchanges session** → `POST /auth/google/exchange-session`
6. **Two possible outcomes:**
   - **Login:** User exists → Get token → Redirect to dashboard
   - **Register:** New user → Show registration form → Complete registration → Get token → Redirect to dashboard

---

## 🔒 Security Features

✅ Token not exposed in URL  
✅ Session is one-time use only  
✅ Session expires after 5 minutes  
✅ HTTPS recommended for production  

---

## 🛠️ API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/google/redirect` | GET | Get Google OAuth URL |
| `/auth/google/callback` | GET | Handle Google redirect (backend) |
| `/auth/google/exchange-session` | POST | Exchange session for auth data |
| `/auth/google/complete-registration` | POST | Complete new user registration |

---

## ⚠️ Important Notes

1. **Backend redirects to:** `http://localhost:3002/auth/google/callback?session=xxx`
2. **Make sure your frontend URL matches** the `FRONTEND_URL` in backend `.env`
3. **Session expires in 5 minutes** - user must complete flow quickly
4. **Session is single-use** - refreshing page will invalidate it

---

## 🐛 Troubleshooting

**Issue:** "Invalid or expired session"  
**Fix:** Session already used or expired. User needs to click "Sign in with Google" again.

**Issue:** Redirect goes to wrong URL  
**Fix:** Check `FRONTEND_URL` in backend `.env` matches your frontend URL.

**Issue:** Token not stored  
**Fix:** Make sure you're calling `localStorage.setItem('auth_token', token)` after successful login/registration.

---

## 📞 Support

For complete API documentation, see: `docs/CLIENT_AUTHENTICATION_API.md`

For detailed examples, see:
- `docs/GOOGLE_OAUTH_CALLBACK_EXAMPLE.jsx`
- `docs/GOOGLE_OAUTH_REGISTER_EXAMPLE.jsx`

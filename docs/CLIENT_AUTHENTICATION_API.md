# StitchIt Client Authentication API Documentation

Complete guide for integrating client authentication in your frontend application.

**Base URL:** `http://127.0.0.1/api/client`  
**Authentication:** Bearer Token (Laravel Sanctum)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Methods](#authentication-methods)
3. [Traditional Authentication (Email/Phone & Password)](#traditional-authentication)
4. [Google OAuth Authentication](#google-oauth-authentication)
5. [Profile Management](#profile-management)
6. [Password Reset Flow](#password-reset-flow)
7. [Error Handling](#error-handling)
8. [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

The StitchIt API supports two authentication methods:

1. **Traditional Login** - Email/Phone and Password
2. **Google OAuth** - Sign in with Google account

Both methods return a **Bearer Token** that must be included in subsequent API requests.

### Token Usage

After successful login/registration, include the token in all protected requests:

```http
Authorization: Bearer {your-token-here}
```

---

## Authentication Methods

### 1. Traditional Authentication

Users can register and login using email or phone number with a password.

### 2. Google OAuth

Users can register or login using their Google account without a password.

---

## Traditional Authentication

### 1.1 Register New Client

**Endpoint:** `POST /api/client/auth/register`

**Description:** Creates a new client account with traditional credentials.

#### Request Body

```json
{
  "full_name": "John Doe",
  "phone": "+263771234567",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!",
  "address": "123 Main St, Harare",
  "gender": "male"
}
```

#### Field Validation

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `full_name` | string | ✅ Yes | Max 255 characters |
| `phone` | string | ✅ Yes | Unique, max 20 characters |
| `email` | string | ❌ No | Valid email, unique |
| `username` | string | ❌ No | Unique, max 255 characters |
| `password` | string | ✅ Yes | Min 8 characters, confirmed |
| `password_confirmation` | string | ✅ Yes | Must match password |
| `address` | string | ❌ No | |
| `gender` | string | ❌ No | Options: male, female, other |

#### Success Response (201)

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+263771234567",
      "email": "john@example.com",
      "username": "johndoe",
      "address": "123 Main St, Harare",
      "gender": "male"
    },
    "token": "1|abcdefghijklmnopqrstuvwxyz123456789"
  }
}
```

#### Error Response (422)

```json
{
  "message": "The phone has already been taken.",
  "errors": {
    "phone": [
      "The phone has already been taken."
    ]
  }
}
```

---

### 1.2 Login Client

**Endpoint:** `POST /api/client/auth/login`

**Description:** Authenticates a client using phone/email and password.

#### Request Body

```json
{
  "login": "+263771234567",
  "password": "SecurePassword123!"
}
```

**Note:** The `login` field accepts either phone number or email address.

#### Field Validation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `login` | string | ✅ Yes | Phone number or email |
| `password` | string | ✅ Yes | User's password |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+263771234567",
      "email": "john@example.com",
      "username": "johndoe",
      "address": "123 Main St, Harare",
      "gender": "male",
      "nickname": null
    },
    "token": "2|newTokenAfterLogin123456789"
  }
}
```

#### Error Response (422)

```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "login": [
      "The provided credentials are incorrect."
    ]
  }
}
```

---

## Google OAuth Authentication

### Overview

Google OAuth allows users to register or login without a password. The flow differs for new and returning users.

### 2.1 Initiate Google OAuth

**Endpoint:** `GET /api/client/auth/google/redirect`

**Description:** Generates the Google OAuth URL for user authentication.

#### Request

No body required. Simple GET request.

```javascript
// Example
fetch('http://127.0.0.1/api/client/auth/google/redirect')
  .then(res => res.json())
  .then(data => {
    window.location.href = data.data.url; // Redirect to Google
  });
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/auth?client_id=902638070510-xxx.apps.googleusercontent.com&redirect_uri=http%3A%2F%2F127.0.0.1%2Fapi%2Fclient%2Fauth%2Fgoogle%2Fcallback&scope=openid+profile+email&response_type=code&state=xyz123"
  }
}
```

**Frontend Action:** Redirect the user's browser to the provided URL.

---

### 2.2 Handle Google Callback

**Endpoint:** `GET /api/client/auth/google/callback`

**Description:** Receives the OAuth callback from Google and redirects to your frontend application with a temporary session key.

**Note:** This endpoint is automatically called by Google after user authentication. It redirects to your frontend with a session key that must be exchanged for auth data.

**Redirect URL:** `{FRONTEND_URL}/auth/google/callback?session=abc123xyz`

**Frontend Action:**

Create a single page at `/auth/google/callback` that handles this redirect:

```javascript
// 1. Extract session key from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionKey = urlParams.get('session');

// 2. Exchange session key for auth data (see next endpoint)
```

---

### 2.3 Exchange Session for Auth Data

**Endpoint:** `POST /api/client/auth/google/exchange-session`

**Description:** Exchange the temporary session key for actual authentication data. This is called by your frontend after receiving the redirect from Google callback.

**Important:** The session is **one-time use only** and expires after 5 minutes.

#### Request Body

```json
{
  "session": "abc123xyz"
}
```

#### Field Validation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session` | string | ✅ Yes | Session key from callback URL |

#### Success Response - Existing User (200)

If the Google account is already registered, user is auto-logged in:

```json
{
  "success": true,
  "data": {
    "type": "login",
    "token": "3|googleAuthToken123456789",
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+263771234567",
      "email": "john@gmail.com",
      "username": "johndoe",
      "address": "123 Main St",
      "gender": "male",
      "avatar": "https://lh3.googleusercontent.com/a/photo.jpg",
      "nickname": null
    }
  }
}
```

**Frontend Action:**
```javascript
// Store token and user data
localStorage.setItem('auth_token', data.data.token);
localStorage.setItem('user', JSON.stringify(data.data.client));

// Redirect to dashboard
window.location.href = '/dashboard';
```

---

#### Success Response - New User (200)

If the Google account is NOT registered, user needs to complete registration:

```json
{
  "success": true,
  "data": {
    "type": "register",
    "google_id": "1234567890",
    "email": "newuser@gmail.com",
    "full_name": "Jane Smith",
    "avatar": "https://lh3.googleusercontent.com/a/photo.jpg"
  }
}
```

**Frontend Action:**
```javascript
// Store Google data temporarily
sessionStorage.setItem('google_registration_data', JSON.stringify(data.data));

// Redirect to registration form
window.location.href = '/auth/google/register';
```

---

#### Error Response (400)

```json
{
  "success": false,
  "message": "Invalid or expired session"
}
```

---

### 2.4 Complete Google Callback - Full Implementation Example

Here's a complete React component for handling the Google callback:

```jsx
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
        // Existing user - auto login
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.client));
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 500);
      } else if (data.data.type === 'register') {
        // New user - go to registration
        sessionStorage.setItem('google_registration_data', JSON.stringify(data.data));
        navigate('/auth/google/register');
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing Google Login...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <p className="text-gray-600">Login Successful! Redirecting...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GoogleCallback;
```

---

### 2.5 Complete Google Registration

**Endpoint:** `POST /api/client/auth/google/complete-registration`

**Description:** Completes the registration for new Google users after form submission.

#### Request Body

```json
{
  "google_id": "1234567890",
  "email": "newuser@gmail.com",
  "full_name": "Jane Smith",
  "phone": "+263771234567",
  "username": "janesmith",
  "address": "456 Oak Ave, Harare",
  "gender": "female",
  "avatar": "https://lh3.googleusercontent.com/a/photo.jpg"
}
```

#### Field Validation

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `google_id` | string | ✅ Yes | From callback response |
| `email` | string | ✅ Yes | From callback, must be unique |
| `full_name` | string | ✅ Yes | Max 255 characters |
| `phone` | string | ✅ Yes | Unique, max 20 characters |
| `username` | string | ❌ No | Auto-generated if not provided |
| `address` | string | ❌ No | |
| `gender` | string | ❌ No | Options: male, female, other |
| `avatar` | string | ❌ No | Google profile picture URL |

#### Success Response (201)

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "client": {
      "id": 2,
      "full_name": "Jane Smith",
      "phone": "+263771234567",
      "email": "newuser@gmail.com",
      "username": "janesmith",
      "address": "456 Oak Ave, Harare",
      "gender": "female",
      "avatar": "https://lh3.googleusercontent.com/a/photo.jpg"
    },
    "token": "4|googleRegisterToken123456789"
  }
}
```

#### Error Response (422)

```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": [
      "The email has already been taken."
    ]
  }
}
```

---

### 2.6 Quick Google Login (Alternative)

**Endpoint:** `POST /api/client/auth/google/login`

**Description:** Alternative endpoint for direct Google login (if you're handling OAuth client-side).

#### Request Body

```json
{
  "google_id": "1234567890",
  "email": "john@gmail.com"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+263771234567",
      "email": "john@gmail.com",
      "username": "johndoe",
      "address": "123 Main St",
      "gender": "male",
      "avatar": "https://lh3.googleusercontent.com/a/photo.jpg"
    },
    "token": "5|quickLoginToken123456789"
  }
}
```

#### Error Response (404)

```json
{
  "success": false,
  "message": "No account found with this Google account"
}
```

---

## Profile Management

### 3.1 Get User Profile

**Endpoint:** `GET /api/client/profile`

**Description:** Retrieves the authenticated user's profile.

**Authentication:** Required (Bearer Token)

#### Request Headers

```http
Authorization: Bearer {your-token}
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone": "+263771234567",
    "email": "john@example.com",
    "username": "johndoe",
    "address": "123 Main St, Harare",
    "gender": "male",
    "nickname": "Johnny",
    "created_at": "2026-01-01T10:00:00.000000Z",
    "last_login_at": "2026-01-05T08:30:00.000000Z"
  }
}
```

---

### 3.2 Update User Profile

**Endpoint:** `PUT /api/client/profile`

**Description:** Updates the authenticated user's profile information.

**Authentication:** Required (Bearer Token)

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "full_name": "John Michael Doe",
  "email": "john.doe@example.com",
  "username": "jmdoe",
  "address": "789 New Street, Harare",
  "gender": "male",
  "nickname": "JD"
}
```

#### Field Validation

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `full_name` | string | ❌ No | Max 255 characters |
| `email` | string | ❌ No | Valid email, unique |
| `username` | string | ❌ No | Unique, max 255 characters |
| `address` | string | ❌ No | |
| `gender` | string | ❌ No | Options: male, female, other |
| `nickname` | string | ❌ No | Max 255 characters |

**Note:** Phone number cannot be updated through this endpoint.

#### Success Response (200)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "full_name": "John Michael Doe",
    "phone": "+263771234567",
    "email": "john.doe@example.com",
    "username": "jmdoe",
    "address": "789 New Street, Harare",
    "gender": "male",
    "nickname": "JD"
  }
}
```

---

### 3.3 Logout

**Endpoint:** `POST /api/client/logout`

**Description:** Logs out the user by revoking all active tokens.

**Authentication:** Required (Bearer Token)

#### Request Headers

```http
Authorization: Bearer {your-token}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Frontend Action:** Clear stored token and redirect to login page.

---

## Password Reset Flow

### 4.1 Request Password Reset

**Endpoint:** `POST /api/client/auth/forgot-password`

**Description:** Initiates password reset by sending a 6-digit code to the user's phone.

#### Request Body

```json
{
  "phone": "+263771234567"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Password reset code sent to your phone",
  "debug_code": "123456"
}
```

**Note:** `debug_code` is only returned in development. In production, the code will be sent via SMS.

#### Error Response (404)

```json
{
  "success": false,
  "message": "No account found with this phone number"
}
```

**Important:** The reset code expires after **10 minutes**.

---

### 4.2 Reset Password with Code

**Endpoint:** `POST /api/client/auth/reset-password`

**Description:** Resets the user's password using the verification code.

#### Request Body

```json
{
  "phone": "+263771234567",
  "code": "123456",
  "password": "NewSecurePassword123!",
  "password_confirmation": "NewSecurePassword123!"
}
```

#### Field Validation

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `phone` | string | ✅ Yes | Registered phone number |
| `code` | string | ✅ Yes | 6-digit verification code |
| `password` | string | ✅ Yes | Min 8 characters, confirmed |
| `password_confirmation` | string | ✅ Yes | Must match password |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### Error Responses

**Invalid Code (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset code"
}
```

**Account Not Found (404):**
```json
{
  "success": false,
  "message": "No account found with this phone number"
}
```

---

## Error Handling

### Standard Error Format

All errors follow Laravel's validation error format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message 1",
      "Error message 2"
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (Registration) |
| 400 | Bad Request |
| 401 | Unauthorized (Invalid/Missing Token) |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Frontend Integration Guide

### Setup Instructions

#### 1. Environment Variables

Create a `.env` file in your frontend project:

```env
VITE_API_BASE_URL=http://127.0.0.1/api/client
VITE_GOOGLE_CLIENT_ID=902638070510-tghk7knfpucvqrufccerrfppk8t4mub0.apps.googleusercontent.com
```

#### 2. API Service Setup

Create an API service file (`src/services/api.js`):

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, ...data };
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiService();
```

---

### 3. Authentication Service

Create auth service (`src/services/auth.js`):

```javascript
import { api } from './api';

export const authService = {
  // Traditional Registration
  async register(data) {
    const response = await api.post('/auth/register', data, { skipAuth: true });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  },

  // Traditional Login
  async login(login, password) {
    const response = await api.post('/auth/login', { login, password }, { skipAuth: true });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  },

  // Get Google OAuth URL
  async getGoogleAuthUrl() {
    const response = await api.get('/auth/google/redirect', { skipAuth: true });
    return response.data.url;
  },

  // Complete Google Registration
  async completeGoogleRegistration(data) {
    const response = await api.post('/auth/google/complete-registration', data, { skipAuth: true });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  },

  // Get User Profile
  async getProfile() {
    return await api.get('/profile');
  },

  // Update Profile
  async updateProfile(data) {
    return await api.put('/profile', data);
  },

  // Logout
  async logout() {
    try {
      await api.post('/logout');
    } finally {
      this.clearToken();
    }
  },

  // Forgot Password
  async forgotPassword(phone) {
    return await api.post('/auth/forgot-password', { phone }, { skipAuth: true });
  },

  // Reset Password
  async resetPassword(phone, code, password, password_confirmation) {
    return await api.post('/auth/reset-password', {
      phone,
      code,
      password,
      password_confirmation
    }, { skipAuth: true });
  },

  // Token Management
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  clearToken() {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
```

---

### 4. Example: Traditional Registration Form

```jsx
import { useState } from 'react';
import { authService } from '../services/auth';

function RegisterForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
    address: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await authService.register(formData);
      console.log('Registration successful:', response);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.status === 422) {
        setErrors(error.errors || {});
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Full Name *</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        {errors.full_name && <span className="error">{errors.full_name[0]}</span>}
      </div>

      <div>
        <label>Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+263771234567"
          required
        />
        {errors.phone && <span className="error">{errors.phone[0]}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email[0]}</span>}
      </div>

      <div>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <span className="error">{errors.username[0]}</span>}
      </div>

      <div>
        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <span className="error">{errors.password[0]}</span>}
      </div>

      <div>
        <label>Confirm Password *</label>
        <input
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

export default RegisterForm;
```

---

### 5. Example: Traditional Login Form

```jsx
import { useState } from 'react';
import { authService } from '../services/auth';

function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await authService.login(login, password);
      console.log('Login successful:', response);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.status === 422) {
        setErrors(error.errors || {});
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Phone or Email</label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Phone or email"
          required
        />
        {errors.login && <span className="error">{errors.login[0]}</span>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <a href="/forgot-password">Forgot Password?</a>
    </form>
  );
}

export default LoginForm;
```

---

### 6. Example: Google OAuth Integration

**Complete Google Login Button Component:**

```jsx
import { FaGoogle } from "react-icons/fa";
import { authService } from '../services/auth';

function GoogleAuthButton() {
  const handleGoogleLogin = async () => {
    try {
      // Get Google OAuth URL from backend
      const url = await authService.getGoogleAuthUrl();
      
      // Redirect to Google (or open in same window)
      window.location.href = url;
    } catch (error) {
      console.error('Google OAuth error:', error);
      alert('Failed to initiate Google login');
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
    >
      <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
      Continue with Google
    </button>
  );
}

export default GoogleAuthButton;
```

---

### 7. Example: Google Registration Form

**Complete Component for Google Registration:**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GoogleRegisterForm() {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get Google data from session storage
    const googleDataStr = sessionStorage.getItem('google_registration_data');
    
    if (!googleDataStr) {
      navigate('/login');
      return;
    }

    try {
      const googleData = JSON.parse(googleDataStr);
      setFormData(prev => ({
        ...prev,
        google_id: googleData.google_id || '',
        email: googleData.email || '',
        full_name: googleData.full_name || '',
        avatar: googleData.avatar || ''
      }));
    } catch (error) {
      console.error('Failed to parse Google data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://127.0.0.1/api/client/auth/google/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Registration failed');
        }
        return;
      }

      // Clear session storage
      sessionStorage.removeItem('google_registration_data');

      // Store token and user data
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.client));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      if (error.status === 422) {
        setErrors(error.errors || {});
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="google-info">
        {formData.avatar && <img src={formData.avatar} alt="Profile" />}
        <p>Signing up with Google</p>
      </div>

      <div>
        <label>Full Name *</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        {errors.full_name && <span className="error">{errors.full_name[0]}</span>}
      </div>

      <div>
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          readOnly
          disabled
        />
        {errors.email && <span className="error">{errors.email[0]}</span>}
      </div>

      <div>
        <label>Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+263771234567"
          required
        />
        {errors.phone && <span className="error">{errors.phone[0]}</span>}
      </div>

      <div>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Optional - auto-generated if empty"
        />
        {errors.username && <span className="error">{errors.username[0]}</span>}
      </div>

      <div>
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Completing Registration...' : 'Complete Registration'}
      </button>
    </form>
  );
}

export default GoogleRegisterForm;
```

---

### 8. Example: Password Reset Flow

```jsx
import { useState } from 'react';
import { authService } from '../services/auth';

function ForgotPasswordForm() {
  const [step, setStep] = useState(1); // 1: Request code, 2: Reset password
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await authService.forgotPassword(phone);
      alert(response.message);
      setStep(2);
    } catch (error) {
      if (error.status === 404) {
        setErrors({ phone: [error.message] });
      } else {
        alert('Failed to send reset code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await authService.resetPassword(
        phone, 
        code, 
        password, 
        passwordConfirmation
      );
      alert(response.message);
      window.location.href = '/login';
    } catch (error) {
      if (error.status === 400 || error.status === 422) {
        alert(error.message);
      } else {
        alert('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={handleRequestCode}>
        <h2>Forgot Password</h2>
        <div>
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+263771234567"
            required
          />
          {errors.phone && <span className="error">{errors.phone[0]}</span>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetPassword}>
      <h2>Reset Password</h2>
      <p>Enter the 6-digit code sent to {phone}</p>
      
      <div>
        <label>Verification Code</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          maxLength="6"
          required
        />
      </div>

      <div>
        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Confirm New Password</label>
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>

      <button type="button" onClick={() => setStep(1)}>
        Resend Code
      </button>
    </form>
  );
}

export default ForgotPasswordForm;
```

---

### 9. Protected Route Example

```jsx
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

Usage:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## Complete Authentication Flow Diagram

### Traditional Registration/Login Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├──► Register Form
       │    └──► POST /auth/register
       │         └──► Returns: { token, client }
       │              └──► Store token → Redirect to dashboard
       │
       └──► Login Form
            └──► POST /auth/login
                 └──► Returns: { token, client }
                      └──► Store token → Redirect to dashboard
```

### Google OAuth Flow (Session-Based)

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       └──► Click "Sign in with Google"
            │
            ├──► GET /auth/google/redirect
            │    └──► Returns: { url }
            │         └──► Redirect to Google
            │
            ├──► User authenticates on Google
            │
            └──► Google redirects to /auth/google/callback (Backend)
                 │
                 └──► Backend creates temporary session key
                      └──► Stores auth data in cache (5 min expiry)
                           └──► Redirects to: /auth/google/callback?session=abc123xyz
                                │
                                └──► Frontend: POST /auth/google/exchange-session
                                     │         Body: { session: "abc123xyz" }
                                     │
                                     ├──► Response type: "login"
                                     │    └──► Returns: { token, client }
                                     │         └──► Store token → Redirect to dashboard
                                     │
                                     └──► Response type: "register"
                                          └──► Returns: { google_id, email, name, avatar }
                                               └──► Store in sessionStorage
                                                    └──► Show registration form (pre-filled)
                                                         └──► User adds phone & confirms
                                                              └──► POST /auth/google/complete-registration
                                                                   └──► Returns: { token, client }
                                                                        └──► Store token → Redirect to dashboard
```
                                                    └──► Store token → Redirect to dashboard
```

---

## Summary

This documentation provides everything needed to integrate authentication in your frontend:

✅ **Traditional Registration & Login** - Email/Phone + Password  
✅ **Google OAuth** - Full flow with new and returning users  
✅ **Profile Management** - Get and update user info  
✅ **Password Reset** - Forgot password flow with SMS codes  
✅ **Complete Code Examples** - Ready-to-use React components  
✅ **Error Handling** - Comprehensive error management  
✅ **Token Management** - Bearer token authentication  

For any questions or issues, refer to the API endpoints and examples provided above.

---

**Last Updated:** January 5, 2026  
**API Version:** 1.0  
**Laravel Version:** 12.0  
**Sanctum Version:** Latest

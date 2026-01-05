# Stitchit ERP - Client API Documentation

## Overview
This API allows clients to interact with the Stitchit ERP system through mobile apps (Flutter) or web applications. All API endpoints are prefixed with `/api/client`.

## Base URL
```
Production: https://your-domain.com/api/client
Development: http://localhost:8000/api/client
```

## Authentication
The API uses Laravel Sanctum for token-based authentication. After login/registration, you'll receive a bearer token that must be included in subsequent requests.

### Headers
```
Authorization: Bearer {your-token-here}
Content-Type: application/json
Accept: application/json
```

---

## Authentication Endpoints

### 1. Register New Client
**POST** `/auth/register`

Create a new client account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "address": "123 Main St, City, Country",
  "gender": "male"
}
```

**Required Fields:**
- `full_name` (string, max 255)
- `phone` (string, max 20, unique)
- `password` (string, min 8, confirmed)

**Optional Fields:**
- `email` (string, email, unique)
- `username` (string, max 255, unique)
- `address` (string)
- `gender` (enum: male, female, other)

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "username": "johndoe",
      "address": "123 Main St, City, Country",
      "gender": "male"
    },
    "token": "1|abc123..."
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Authenticate a client using phone number or email.

**Request Body:**
```json
{
  "login": "+1234567890",
  "password": "SecurePass123!"
}
```

**Fields:**
- `login` (string, required) - Phone number or email
- `password` (string, required)

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "username": "johndoe",
      "address": "123 Main St",
      "gender": "male",
      "nickname": null
    },
    "token": "2|xyz789..."
  }
}
```

---

### 3. Get Profile
**GET** `/profile`

Get authenticated client's profile information.

**Headers Required:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "username": "johndoe",
    "address": "123 Main St",
    "gender": "male",
    "nickname": null,
    "created_at": "2026-01-01T10:00:00Z",
    "last_login_at": "2026-01-03T08:30:00Z"
  }
}
```

---

### 4. Update Profile
**PUT** `/profile`

Update client profile information.

**Request Body:**
```json
{
  "full_name": "John Updated",
  "email": "newemail@example.com",
  "username": "johnupdated",
  "address": "456 New St",
  "gender": "male",
  "nickname": "Johnny"
}
```

**All Fields Optional:**
- `full_name` (string, max 255)
- `email` (string, email, unique)
- `username` (string, max 255, unique)
- `address` (string)
- `gender` (enum: male, female, other)
- `nickname` (string, max 255)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "full_name": "John Updated",
    "phone": "+1234567890",
    "email": "newemail@example.com",
    "username": "johnupdated",
    "address": "456 New St",
    "gender": "male",
    "nickname": "Johnny"
  }
}
```

---

### 5. Logout
**POST** `/logout`

Revoke current authentication token.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 6. Forgot Password
**POST** `/auth/forgot-password`

Request a password reset code (sent via SMS).

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset code sent to your phone",
  "debug_code": "123456"
}
```

*Note: `debug_code` is only included in development. In production, code is sent via SMS.*

---

### 7. Reset Password
**POST** `/auth/reset-password`

Reset password using the code received.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "code": "123456",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Order Management Endpoints

### 8. Get All Orders
**GET** `/orders`

Retrieve all orders for the authenticated client.

**Query Parameters:**
- `page` (integer, default: 1)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "ORD-20260103-0001",
      "state": "IN_PRODUCTION",
      "state_label": "In Production",
      "total_amount": "1500.00",
      "paid_amount": "500.00",
      "balance": "1000.00",
      "items_count": 2,
      "delivery_address": "123 Main St",
      "delivery_date": "2026-02-01",
      "notes": "Custom design requested",
      "created_at": "2026-01-03T10:00:00Z",
      "items": [
        {
          "id": 1,
          "description": "Persian design rug",
          "width": 200,
          "height": 300,
          "quantity": 1,
          "price_per_item": "900.00",
          "total_price": "900.00",
          "design_image_url": "https://domain.com/storage/designs/image.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 45
  }
}
```

---

### 9. Get Single Order
**GET** `/orders/{id}`

Get detailed information about a specific order.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "ORD-20260103-0001",
    "state": "IN_PRODUCTION",
    "state_label": "In Production",
    "total_amount": "1500.00",
    "paid_amount": "500.00",
    "balance": "1000.00",
    "delivery_address": "123 Main St",
    "delivery_date": "2026-02-01",
    "notes": "Custom design",
    "created_at": "2026-01-03T10:00:00Z",
    "items": [
      {
        "id": 1,
        "description": "Persian design rug",
        "width": 200,
        "height": 300,
        "quantity": 1,
        "price_per_item": "900.00",
        "total_price": "900.00",
        "design_image_url": "https://domain.com/storage/designs/image.jpg",
        "production_status": "TUFTING"
      }
    ],
    "payments": [
      {
        "id": 1,
        "amount": "500.00",
        "payment_method": "CASH",
        "paid_at": "2026-01-03T10:00:00Z",
        "notes": "Deposit payment"
      }
    ]
  }
}
```

---

### 10. Place New Order
**POST** `/orders`

Create a new order with multiple items.

**Request Body (multipart/form-data):**
```json
{
  "items": [
    {
      "description": "Custom Persian rug",
      "width": 200,
      "height": 300,
      "quantity": 1,
      "unit": "cm",
      "design_image": "file upload",
      "notes": "Blue and gold colors preferred"
    }
  ],
  "delivery_address": "123 Main St, City",
  "notes": "Please call before delivery"
}
```

**Item Fields:**
- `description` (string, required)
- `width` (numeric, required)
- `height` (numeric, required)
- `quantity` (integer, required, min: 1)
- `unit` (string, optional, default: cm, options: cm, m, in, ft)
- `design_image` (file, optional, max: 5MB)
- `notes` (string, optional)

**Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": 1,
    "reference": "ORD-20260103-0001",
    "total_amount": "900.00",
    "state": "DRAFT"
  }
}
```

---

## Finished Products Endpoints

### 11. Get Finished Products
**GET** `/finished-products`

Get all published finished products for the authenticated client.

**Query Parameters:**
- `page` (integer, default: 1)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "FP-20260103-0001",
      "product_name": "Persian design rug",
      "description": "Beautiful handcrafted rug",
      "dimensions": "200 × 300 cm",
      "length": 300,
      "width": 200,
      "unit": "cm",
      "status": "IN_STOCK",
      "status_label": "In Stock",
      "quality_status": "PASSED",
      "primary_image": "https://domain.com/storage/finished-products/main.jpg",
      "images": [
        "https://domain.com/storage/finished-products/img1.jpg",
        "https://domain.com/storage/finished-products/img2.jpg"
      ],
      "order_reference": "ORD-20260103-0001",
      "published_at": "2026-01-05T10:00:00Z",
      "notes": "Ready for pickup"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 20
  }
}
```

---

### 12. Get Single Finished Product
**GET** `/finished-products/{id}`

Get detailed information about a specific finished product.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "FP-20260103-0001",
    "product_name": "Persian design rug",
    "description": "Beautiful handcrafted rug",
    "dimensions": "200 × 300 cm",
    "length": 300,
    "width": 200,
    "unit": "cm",
    "status": "IN_STOCK",
    "status_label": "In Stock",
    "quality_status": "PASSED",
    "quality_notes": "Excellent quality, passed all checks",
    "storage_location": "Warehouse A, Shelf 3",
    "primary_image": "https://domain.com/storage/finished-products/main.jpg",
    "images": [
      "https://domain.com/storage/finished-products/img1.jpg",
      "https://domain.com/storage/finished-products/img2.jpg",
      "https://domain.com/storage/finished-products/img3.jpg"
    ],
    "order": {
      "id": 1,
      "reference": "ORD-20260103-0001",
      "state": "COMPLETED"
    },
    "published_at": "2026-01-05T10:00:00Z",
    "notes": "Ready for pickup"
  }
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "phone": [
      "The phone has already been taken."
    ],
    "email": [
      "The email must be a valid email address."
    ]
  }
}
```

### Authentication Error (401)
```json
{
  "message": "Unauthenticated."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to process request",
  "error": "Error details..."
}
```

---

## Order States
- `DRAFT` - Order created but not confirmed
- `PENDING` - Waiting for approval
- `APPROVED` - Approved and ready for production
- `DEPOSIT_PAID` - Deposit payment received
- `IN_PRODUCTION` - Currently being produced
- `COMPLETED` - Production finished
- `DELIVERED` - Delivered to client
- `CANCELLED` - Order cancelled

## Product Statuses
- `IN_STOCK` - Available in warehouse
- `RESERVED` - Reserved for client
- `DELIVERED` - Delivered to client
- `SOLD` - Sold and completed

## Quality Statuses
- `PASSED` - Passed quality check
- `NEEDS_REWORK` - Requires additional work
- `FAILED` - Did not pass quality standards

---

## Flutter Integration Example

```dart
// API Service
class ApiService {
  final String baseUrl = 'https://your-domain.com/api/client';
  String? _token;

  Future<Map<String, dynamic>> login(String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'login': phone, 'password': password}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['data']['token'];
      return data;
    }
    throw Exception('Failed to login');
  }

  Future<Map<String, dynamic>> getOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load orders');
  }
}
```

---

## React/Web Integration Example

```javascript
// API Service
const API_BASE = 'https://your-domain.com/api/client';

export const apiClient = {
  setToken(token) {
    localStorage.setItem('client_token', token);
  },

  async login(phone, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: phone, password }),
    });
    const data = await response.json();
    this.setToken(data.data.token);
    return data;
  },

  async getOrders() {
    const token = localStorage.getItem('client_token');
    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
```

---

## Rate Limiting
- API requests are limited to 60 requests per minute per IP address
- Authentication endpoints have stricter limits (5 attempts per minute)

## Support
For API support, contact: support@stitchit.com

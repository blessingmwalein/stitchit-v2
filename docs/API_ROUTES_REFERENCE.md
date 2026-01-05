# API Routes Quick Reference

## Base URL
```
/api/client
```

## 🔓 Public Routes (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new client |
| POST | `/auth/login` | Login with phone/email |
| POST | `/auth/forgot-password` | Request password reset code |
| POST | `/auth/reset-password` | Reset password with code |

## 🔒 Protected Routes (Bearer Token Required)

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get client profile |
| PUT | `/profile` | Update profile |
| POST | `/logout` | Logout (revoke token) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders (paginated) |
| GET | `/orders/{id}` | Get single order details |
| POST | `/orders` | Place new order |

### Finished Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/finished-products` | List published products |
| GET | `/finished-products/{id}` | Get product details |

## 🔧 Admin Routes (Web - Auth Required)

### Finished Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/finished-products` | List all finished products |
| POST | `/admin/finished-products/from-job/{jobId}` | Create from production job |
| POST | `/admin/finished-products/{id}/publish` | Publish to client portal |
| POST | `/admin/finished-products/{id}/unpublish` | Unpublish from portal |

## 📋 Sample Requests

### Register
```bash
POST /api/client/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "+1234567890",
  "password": "password123",
  "password_confirmation": "password123",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

### Login
```bash
POST /api/client/auth/login
Content-Type: application/json

{
  "login": "+1234567890",
  "password": "password123"
}
```

### Place Order
```bash
POST /api/client/orders
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "items": [
    {
      "description": "Custom rug",
      "width": 200,
      "height": 300,
      "quantity": 1,
      "design_image": <file>
    }
  ],
  "delivery_address": "123 Main St",
  "notes": "Please call before delivery"
}
```

### Get Orders
```bash
GET /api/client/orders?page=1
Authorization: Bearer {token}
```

### Get Finished Products
```bash
GET /api/client/finished-products?page=1
Authorization: Bearer {token}
```

## 🎯 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

## 🔑 Authentication Header
```
Authorization: Bearer 1|abc123xyz...
```

## 📄 Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

## 🏷️ Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

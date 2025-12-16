# Stitchit ERP v2 - Quick Start Guide

## 🚀 Quick Setup

### Option 1: Using Setup Script (Recommended)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

### Option 2: Manual Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_DATABASE=stitchit_v2
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Install dependencies
npm install

# Build assets
npm run dev

# Start server
php artisan serve
```

## 👤 Sample Login Credentials

### Administrator (Full Access)
- **Email:** `admin@stitchit.com`
- **Password:** `password`

### Manager (Most Permissions)
- **Email:** `manager@stitchit.com`
- **Password:** `password`

### Production Staff
- **Email:** `production@stitchit.com`
- **Password:** `password`

### Sales Representative
- **Email:** `sales@stitchit.com`
- **Password:** `password`

### Quick Test Login
- **Email:** `test@test.com`
- **Password:** `test`

## 📋 Features Overview

### ✅ Completed Modules

1. **Client Management**
   - CRUD operations
   - Search functionality
   - Order history tracking
   - `/admin/clients`

2. **Order Management**
   - 8-state workflow (Quote → Shipped)
   - Multi-item orders with dimensions
   - Payment tracking (deposit & balance)
   - Auto-generated references (ORD-YYYYMMDD-0001)
   - `/admin/orders`

3. **Inventory Management**
   - SKU-based tracking
   - Average cost calculation (weighted)
   - Reorder point alerts
   - Stock adjustments with audit trail
   - 6 material types (yarn, cloth, glue, etc.)
   - `/admin/inventory`

4. **Production Management**
   - 6-state job workflow
   - BOM (Bill of Materials) allocation
   - Material consumption tracking (FIFO)
   - Cost snapshots (budgeted vs actual)
   - Staff assignments
   - Auto-generated job refs (JOB-YYYYMMDD-0001)
   - `/admin/production`

5. **Purchase Orders**
   - 5-state workflow
   - Goods receiving with lot tracking
   - Automatic average cost recalculation
   - Supplier management
   - Auto-generated PO refs (PO-YYYYMMDD-0001)
   - `/admin/purchases`

6. **Roles & Permissions**
   - 4 predefined roles
   - 35+ granular permissions
   - Module-based access control

7. **Media Library**
   - File uploads for design assets
   - Finished rug gallery
   - `/admin/media/upload`

## 🎨 Design System

### Brand Colors
- **Primary:** `#FF8A50` (Deep Orange)
- **Secondary:** `#FF9B71` (Light Orange)
- **Gradient:** Deep Light Orange theme throughout

### Tech Stack
- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 19, TypeScript, Inertia.js
- **State:** Redux Toolkit
- **Styling:** TailwindCSS 4.0
- **UI:** Radix UI, HeadlessUI

## 📁 Architecture

```
Backend:
├── Controllers (Thin) → Services (Business Logic) → Repositories (Data Access) → Models

Frontend:
├── Pages (Inertia) → Components (UI) → Redux Store (State) → API (Axios)
```

## 🔐 Permission Groups

- **clients.*** - Client management
- **orders.*** - Order management
- **inventory.*** - Inventory control
- **production.*** - Production operations
- **purchases.*** - Procurement
- **accounting.*** - Financial operations
- **admin.*** - System administration

## 🗄️ Database Schema

19 tables with full relationships:
- Core: clients, orders, order_items
- Assets: rug_design_assets, finished_rug_assets
- Payments: payments
- Inventory: inventory_items, stock_lots, inventory_transactions
- Procurement: suppliers, purchase_orders, purchase_lines
- Production: production_jobs, bom_lines, material_consumptions
- Accounting: expenses, ledger_entries, cost_snapshots
- Fulfillment: dispatches

## 📊 Key Features

### State Machines
- **Orders:** 8 states with validation
- **Production:** 6 states with workflow
- **Purchases:** 5 states with goods receiving

### Business Logic
- Auto-reference generation
- Deposit enforcement
- FIFO material consumption
- Weighted average costing
- Budget vs actual variance tracking
- Dimension conversion (cm/m/in/ft)

## 🛠️ Development Commands

```bash
# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Create new seeder
php artisan make:seeder SupplierSeeder

# Run specific seeder
php artisan db:seed --class=SupplierSeeder

# Fresh migration with seed
php artisan migrate:fresh --seed

# Start dev server
php artisan serve

# Build assets
npm run dev

# Build for production
npm run build
```

## 📝 API Routes (All under /admin prefix)

- **Clients:** 6 endpoints (CRUD + search)
- **Orders:** 8 endpoints (CRUD + transitions + payments + convert)
- **Inventory:** 7 endpoints (CRUD + adjust + reorder alerts)
- **Production:** 9 endpoints (CRUD + transitions + materials + assign)
- **Purchases:** 8 endpoints (CRUD + send + receive + close)
- **Media:** 3 endpoints (upload + delete + list)

**Total: 41 API endpoints**

## 🔗 Quick Links

- Login: `http://localhost:8000/login`
- Dashboard: `http://localhost:8000/dashboard`
- Clients: `http://localhost:8000/admin/clients`
- Orders: `http://localhost:8000/admin/orders`
- Inventory: `http://localhost:8000/admin/inventory`
- Production: `http://localhost:8000/admin/production`
- Purchases: `http://localhost:8000/admin/purchases`

## 📞 Support

For issues or questions, check:
- `IMPLEMENTATION_PROGRESS.md` - Detailed project tracking
- Database migrations in `database/migrations/`
- Service classes in `app/Services/`
- Redux slices in `resources/js/store/slices/`

---

**Happy coding! 🎨🧵**

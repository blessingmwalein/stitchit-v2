# Stitchit ERP v2

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

**Complete ERP system for tufting rug manufacturing business**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Overview

Stitchit ERP v2 is a comprehensive enterprise resource planning system designed specifically for tufting rug manufacturing startups. It manages the complete workflow from client orders to production, inventory, procurement, and fulfillment.

### Key Highlights

- 🎨 **Image-Driven Orders** - Upload design assets for custom rugs
- 📊 **Complete Inventory Tracking** - FIFO, average costing, reorder alerts
- 🏭 **Production Management** - BOM allocation, material consumption, cost tracking
- 💰 **Payment Handling** - Deposit enforcement, balance tracking
- 📦 **Purchase Orders** - Supplier management, goods receiving
- 🔐 **Role-Based Access** - 4 roles, 35+ permissions

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/PostgreSQL

### Installation

```bash
# Clone repository
git clone <repository-url>
cd stitchit-v2

# Run setup script
./setup.sh        # Linux/Mac
# or
setup.bat         # Windows

# The script will:
# ✓ Copy .env file
# ✓ Generate app key
# ✓ Run migrations
# ✓ Seed sample data
# ✓ Create 5 test users
```

### Start Development

```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Start Vite
npm run dev

# Visit: http://localhost:8000
```

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@stitchit.com` | `password` |
| **Manager** | `manager@stitchit.com` | `password` |
| **Production** | `production@stitchit.com` | `password` |
| **Sales** | `sales@stitchit.com` | `password` |
| **Test** | `test@test.com` | `test` |

## ✨ Features

### 🧑‍💼 Client Management
- Searchable client database
- Phone-based quick lookup
- Order history & spending analytics
- Address & contact management

### 📝 Order Management
- **8-State Workflow:** Quote → Awaiting Deposit → Deposit Paid → Approved → In Production → Completed → Shipped → Cancelled
- Multi-item orders with dimensions (cm/m/in/ft)
- Deposit & payment tracking
- Auto-generated references (ORD-20251204-0001)
- Convert approved orders to production jobs

### 📦 Inventory Management
- **6 Material Types:** Yarn, Tufting Cloth, Backing Cloth, Glue, Glue Stick, Accessories
- SKU-based tracking
- Weighted average cost calculation
- Reorder point alerts
- Stock adjustment with audit trail
- Real-time stock levels

### 🏭 Production Management
- **6-State Workflow:** Draft → Scheduled → In Progress → Quality Check → Completed → Cancelled
- BOM (Bill of Materials) allocation
- FIFO material consumption
- Actual vs budgeted cost tracking
- Staff assignment
- Auto-generated job refs (JOB-20251204-0001)

### 🛒 Purchase Orders
- **5-State Workflow:** Draft → Sent → Partially Received → Received → Closed
- Supplier management
- Goods receiving with lot tracking
- Automatic average cost recalculation
- Expected delivery tracking
- Auto-generated PO refs (PO-20251204-0001)

### 📊 Accounting & Costing
- Expense tracking
- Ledger entries
- Cost snapshots per production job
- Budget vs actual variance analysis
- Material cost allocation

### 🚚 Fulfillment
- Dispatch tracking
- Shipment status monitoring
- Delivery confirmation

### 🖼️ Media Library
- Design asset uploads
- Finished rug gallery
- Public gallery for showcasing work

## 🏗️ Tech Stack

### Backend
- **Framework:** Laravel 12
- **PHP:** 8.2+
- **Architecture:** MVC + Repository Pattern + Service Layer
- **Database:** MySQL (normalized schema, 19 tables)
- **API:** Inertia.js for SSR/SPA

### Frontend
- **Framework:** React 19
- **Language:** TypeScript 5.7
- **State Management:** Redux Toolkit
- **Routing:** Inertia.js
- **Styling:** TailwindCSS 4.0
- **UI Components:** Radix UI, HeadlessUI
- **Forms:** React Hook Form + Yup (planned)

### DevOps
- **Build:** Vite 7.0
- **Package Manager:** npm
- **Docker:** Configured for deployment
- **Queue:** Laravel Queue (database driver)

## 📁 Project Structure

```
stitchit-v2/
├── app/
│   ├── Http/Controllers/Admin/     # Thin controllers
│   ├── Services/                   # Business logic
│   ├── Repositories/               # Data access layer
│   ├── Models/                     # Eloquent models
│   └── Providers/                  # Service providers
├── database/
│   ├── migrations/                 # 21 migrations
│   └── seeders/                    # Role & user seeders
├── resources/
│   ├── js/
│   │   ├── pages/admin/           # Inertia pages
│   │   ├── components/ui/         # Reusable UI components
│   │   ├── store/                 # Redux store & slices
│   │   └── layouts/               # Layout components
│   └── css/
│       └── app.css                # Tailwind + brand colors
├── routes/
│   └── web.php                    # 44 API routes
├── setup.sh / setup.bat           # Setup scripts
├── QUICKSTART.md                  # Quick reference
└── IMPLEMENTATION_PROGRESS.md     # Detailed tracking
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference guide
- **[IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md)** - Detailed project tracking
- **API Routes:** All documented in `routes/web.php`
- **Database Schema:** See migrations in `database/migrations/`

## 🔐 Permissions System

### Roles
- **Admin** - Full system access
- **Manager** - All except admin functions
- **Production** - Production & inventory view
- **Sales** - Clients, orders, payments

### Permission Groups
- `clients.*` - 4 permissions
- `orders.*` - 6 permissions
- `inventory.*` - 5 permissions
- `production.*` - 6 permissions
- `purchases.*` - 6 permissions
- `accounting.*` - 3 permissions
- `admin.*` - 3 permissions

**Total: 35+ granular permissions**

## 🎨 Design System

### Brand Colors
- **Primary:** `#FF8A50` (Deep Orange)
- **Secondary:** `#FF9B71` (Light Orange)
- **Theme:** Orange gradient with white accents

### UI Components
- Badge (with state variants)
- DataTable (sortable, paginated)
- Pagination
- Notification (toast system)
- EmptyState
- StatCard (dashboard metrics)
- Forms (inputs, selects, buttons)

## 🗄️ Database Schema

### Core Tables (19)
1. `clients` - Customer database
2. `orders` - Order headers
3. `order_items` - Order line items with dimensions
4. `rug_design_assets` - Uploaded design files
5. `payments` - Payment records
6. `suppliers` - Supplier database
7. `inventory_items` - Material catalog
8. `purchase_orders` - PO headers
9. `purchase_lines` - PO line items
10. `stock_lots` - FIFO lot tracking
11. `production_jobs` - Manufacturing jobs
12. `bom_lines` - Bill of materials
13. `material_consumptions` - Actual usage
14. `inventory_transactions` - Audit trail
15. `expenses` - General expenses
16. `ledger_entries` - Accounting entries
17. `dispatches` - Shipment tracking
18. `finished_rug_assets` - Gallery photos
19. `cost_snapshots` - Production costing

### Access Control (4)
- `roles` - Role definitions
- `permissions` - Permission catalog
- `role_permissions` - Role-permission mapping
- `user_roles` - User-role assignments

### Media (1)
- `media` - File attachments

## 🛠️ Development

### Useful Commands

```bash
# Database
php artisan migrate                # Run migrations
php artisan migrate:fresh --seed   # Fresh start with data
php artisan db:seed                # Seed only

# Make files
php artisan make:migration CreateTableName
php artisan make:model ModelName
php artisan make:controller ControllerName
php artisan make:seeder SeederName

# Cache
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Frontend
npm run dev                        # Development
npm run build                      # Production build
```

### Code Structure

#### Backend Flow
```
Request → Controller → Service → Repository → Model → Database
```

#### Frontend Flow
```
Page → Component → Redux Action → API Call → State Update → Re-render
```

## 🚀 Deployment

### Production Checklist

```bash
# Environment
cp .env.example .env.production
# Configure: APP_ENV=production, APP_DEBUG=false

# Dependencies
composer install --optimize-autoloader --no-dev
npm ci --production

# Build
npm run build

# Database
php artisan migrate --force

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Queue
php artisan queue:work --daemon
```

### Docker Deployment

```bash
docker-compose up -d
```

## 📊 Statistics

- **Backend Files:** 50+ PHP files
- **Frontend Files:** 30+ TypeScript/React files
- **Migrations:** 21 database migrations
- **Models:** 17 Eloquent models
- **Controllers:** 6 controllers
- **Services:** 5 service classes
- **Repositories:** 5 repository implementations
- **API Routes:** 44 endpoints
- **Redux Slices:** 6 state slices
- **UI Components:** 10+ reusable components
- **Admin Pages:** 5 main modules

## 🤝 Contributing

This is a proprietary ERP system for Stitchit startup. Internal development only.

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Development Team

Built with ❤️ for Stitchit ERP v2

---

<div align="center">

**🎨 Making custom rugs management seamless 🧵**

</div>
# stitchit-v2

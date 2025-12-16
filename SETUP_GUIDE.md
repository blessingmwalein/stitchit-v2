# 🚀 Stitchit ERP - Complete Setup Instructions

## Step-by-Step Setup Guide

### Step 1: Environment Setup

```bash
# Navigate to project directory
cd /home/bling/projects/stitchit-v2

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 2: Configure Database

Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stitchit_v2
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Step 3: Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### Step 4: Run Migrations & Seeders

```bash
# Option A: Use setup script (Recommended)
chmod +x setup.sh
./setup.sh

# Option B: Manual setup
php artisan migrate:fresh
php artisan db:seed
```

### Step 5: Storage Link

```bash
# Create symbolic link for public storage
php artisan storage:link
```

### Step 6: Start Development Servers

```bash
# Terminal 1: Laravel server
php artisan serve
# Access at: http://localhost:8000

# Terminal 2: Vite dev server (new terminal)
npm run dev
```

## 🎯 Test the System

### 1. Login
Visit: `http://localhost:8000/login`

Use test credentials:
```
Email:    test@test.com
Password: test
```

### 2. Explore Modules

**Dashboard:**
- URL: `/dashboard`
- Overview of system

**Clients Module:**
- URL: `/admin/clients`
- Create a new client
- Search for clients

**Orders Module:**
- URL: `/admin/orders`
- Create order for a client
- Add multiple items with dimensions
- Record deposit payment
- Transition through states

**Inventory Module:**
- URL: `/admin/inventory`
- Add materials (yarn, cloth, etc.)
- Check stock levels
- Adjust inventory

**Production Module:**
- URL: `/admin/production`
- View production jobs
- Allocate materials (BOM)
- Record consumption
- Track costs

**Purchase Orders:**
- URL: `/admin/purchases`
- Create PO for supplier
- Send to supplier
- Receive goods
- Check average cost updates

## 🔍 Verify Installation

### Check Database Tables
```bash
php artisan tinker
```

Then in Tinker:
```php
// Check migrations
Schema::hasTable('users'); // Should return true
Schema::hasTable('orders'); // Should return true
Schema::hasTable('inventory_items'); // Should return true

// Check seeded data
User::count(); // Should return 5
Role::count(); // Should return 4
Permission::count(); // Should return 35+

// Check first user
User::first()->email; // Should return admin@stitchit.com
```

### Check Routes
```bash
php artisan route:list --path=admin
```

Should show 44+ routes under `/admin` prefix.

## 📝 Sample Data Creation

### Create Sample Client
```bash
php artisan tinker
```

```php
$client = \App\Models\Client::create([
    'phone' => '+1234567890',
    'full_name' => 'John Doe',
    'nickname' => 'JD',
    'address' => '123 Main St, City, State 12345',
    'gender' => 'male',
    'notes' => 'Sample client for testing'
]);
```

### Create Sample Order
```php
$order = \App\Models\Order::create([
    'client_id' => 1,
    'state' => 'QUOTE',
    'deposit_percent' => 30,
    'notes' => 'Sample order',
    'preferred_dimensions_unit' => 'cm'
]);

$orderItem = \App\Models\OrderItem::create([
    'order_id' => $order->id,
    'description' => 'Custom floral rug',
    'quantity' => 1,
    'width' => 100,
    'height' => 150,
    'unit' => 'cm',
    'planned_price' => 500.00
]);

echo "Order created: " . $order->reference;
```

### Create Sample Inventory Item
```php
$item = \App\Models\InventoryItem::create([
    'sku' => 'YARN-001',
    'name' => 'Wool Yarn - Red',
    'type' => 'yarn',
    'unit' => 'kg',
    'current_stock' => 50,
    'average_cost' => 25.00,
    'reorder_point' => 10,
    'description' => 'Premium wool yarn in red color'
]);

echo "Inventory item created: " . $item->sku;
```

## 🐛 Troubleshooting

### Issue: Migration Failed
```bash
# Drop all tables and retry
php artisan migrate:fresh

# If still fails, check database connection
php artisan config:clear
php artisan cache:clear
```

### Issue: Permission Denied on setup.sh
```bash
# Make script executable
chmod +x setup.sh
```

### Issue: npm run dev fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Assets not loading
```bash
# Clear compiled assets
rm -rf public/build

# Rebuild
npm run build
```

### Issue: 500 Error
```bash
# Check logs
tail -f storage/logs/laravel.log

# Clear all caches
php artisan optimize:clear
```

### Issue: Database connection refused
```env
# Check .env database credentials
# For SQLite (easier testing):
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

# Create SQLite database
touch database/database.sqlite
php artisan migrate:fresh --seed
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- PHP Intelephense
- Laravel Extra Intellisense
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### Browser Extensions
- React Developer Tools
- Redux DevTools

## 📊 Production Deployment

### 1. Environment Configuration
```bash
# Set production environment
APP_ENV=production
APP_DEBUG=false

# Set proper APP_URL
APP_URL=https://yourdomain.com
```

### 2. Optimize for Production
```bash
# Install dependencies
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build assets
npm run build
```

### 3. Set Permissions
```bash
# Set proper permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 4. Configure Web Server

**Nginx example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/stitchit-v2/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 5. Setup Queue Worker (Optional)
```bash
# Using systemd
sudo nano /etc/systemd/system/stitchit-worker.service
```

```ini
[Unit]
Description=Stitchit Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /path/to/stitchit-v2/artisan queue:work --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable stitchit-worker
sudo systemctl start stitchit-worker
```

## 🎉 Success!

Your Stitchit ERP system is now ready to use!

**Next Steps:**
1. Login at `/login`
2. Create your first client
3. Create an order
4. Set up inventory
5. Start production!

For detailed feature documentation, see `QUICKSTART.md`

For implementation details, see `IMPLEMENTATION_PROGRESS.md`

---

**Need help?** Check the logs:
- Laravel: `storage/logs/laravel.log`
- Nginx: `/var/log/nginx/error.log`
- PHP-FPM: `/var/log/php8.2-fpm.log`

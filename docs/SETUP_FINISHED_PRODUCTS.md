# Setup Instructions for New Features

## Overview
This guide covers the setup for:
1. FinishedProduct system
2. Client Authentication & API
3. Production Job Completion Modal

## Step 1: Run Migrations

```bash
# Run migrations to create new tables
php artisan migrate

# This will create:
# - finished_products table
# - Add auth fields to clients table
```

## Step 2: Register API Routes

Update `bootstrap/app.php` or `routes/api.php` to include client API routes:

```php
// In bootstrap/app.php or create routes/api.php
use Illuminate\Support\Facades\Route;

Route::prefix('api/client')
    ->middleware('api')
    ->group(base_path('routes/api-client.php'));
```

Or manually add to `routes/api.php`:
```php
require __DIR__.'/api-client.php';
```

## Step 3: Configure Sanctum

Ensure Laravel Sanctum is configured in `config/sanctum.php`:

```php
'guard' => ['web', 'sanctum'],

'middleware' => [
    'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
],

'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## Step 4: Update Environment Variables

Add to `.env`:
```env
# For mobile app CORS
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,your-mobile-app-domain.com
SESSION_DRIVER=cookie
SESSION_DOMAIN=.yourdomain.com
```

## Step 5: Install Missing Dependencies (if needed)

```bash
# If Textarea component is missing
# Create it or install from shadcn
npx shadcn-ui@latest add textarea

# If any other components are missing
npm install
npm run build
```

## Step 6: Clear Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

## Step 7: Test the Setup

### Test Frontend Modal
1. Navigate to Production page
2. Open a job in QUALITY_CHECK state
3. Click "Move to COMPLETED"
4. Modal should appear to create finished product

### Test API Endpoints

**Register:**
```bash
curl -X POST http://localhost:8000/api/client/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "full_name": "Test Client",
    "phone": "+1234567890",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "+1234567890",
    "password": "password123"
  }'
```

**Get Orders (with token):**
```bash
curl -X GET http://localhost:8000/api/client/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

## Step 8: CORS Configuration (for mobile apps)

Update `config/cors.php`:
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // In production, specify your mobile app domain
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Files Created

### Backend Files
1. **Models:**
   - `app/Models/FinishedProduct.php`
   - `app/Models/Client.php` (updated)

2. **Migrations:**
   - `database/migrations/2026_01_03_000001_create_finished_products_table.php`
   - `database/migrations/2026_01_03_000002_add_auth_fields_to_clients_table.php`

3. **Repositories:**
   - `app/Repositories/Contracts/FinishedProductRepositoryInterface.php`
   - `app/Repositories/Eloquent/FinishedProductRepository.php`

4. **Services:**
   - `app/Services/FinishedProductService.php`

5. **Controllers:**
   - `app/Http/Controllers/Admin/FinishedProductController.php`
   - `app/Http/Controllers/Api/Client/AuthController.php`
   - `app/Http/Controllers/Api/Client/OrderController.php`
   - `app/Http/Controllers/Api/Client/FinishedProductController.php`

6. **Requests:**
   - `app/Http/Requests/Api/Client/RegisterRequest.php`
   - `app/Http/Requests/Api/Client/LoginRequest.php`
   - `app/Http/Requests/Api/Client/UpdateProfileRequest.php`
   - `app/Http/Requests/Api/Client/PlaceOrderRequest.php`

7. **Routes:**
   - `routes/api-client.php`
   - `routes/web.php` (updated)

### Frontend Files
1. **Components:**
   - `resources/js/components/modals/CompleteJobModal.tsx`
   - `resources/js/components/drawers/ProductionDetailDrawer.tsx` (updated)

### Documentation
1. `docs/CLIENT_API_DOCUMENTATION.md` - Complete API documentation

## Usage Workflow

### Production Job Completion Flow
1. Job reaches QUALITY_CHECK stage
2. User clicks "Move to COMPLETED"
3. **CompleteJobModal** opens
4. User fills in:
   - Quality status (PASSED/NEEDS_REWORK/FAILED)
   - Quality notes
   - Storage location
   - Product status
   - Product images
   - Additional notes
5. On submit:
   - Creates **FinishedProduct** record
   - Transitions job to COMPLETED
   - Links to production job, order, and client
6. Product is now in system and can be:
   - Published to client portal
   - Tracked in inventory
   - Viewed by client via API

### Client Mobile App Flow
1. Client registers/logs in via API
2. Client can:
   - Place orders with images
   - View order status
   - Track production progress
   - View finished products
   - Update profile

## Troubleshooting

### Issue: "Class FinishedProductRepositoryInterface not found"
**Solution:** Run `composer dump-autoload`

### Issue: "Table 'finished_products' doesn't exist"
**Solution:** Run `php artisan migrate`

### Issue: "Unauthenticated" on API requests
**Solution:** 
- Ensure token is included in Authorization header
- Check SANCTUM_STATEFUL_DOMAINS in .env
- Clear config cache: `php artisan config:clear`

### Issue: CORS errors from mobile app
**Solution:**
- Update `config/cors.php` allowed_origins
- Ensure Sanctum middleware is configured
- Check SANCTUM_STATEFUL_DOMAINS

### Issue: "Storage link not working for images"
**Solution:** Run `php artisan storage:link`

## Production Deployment Checklist

- [ ] Run migrations
- [ ] Update .env with production domains
- [ ] Configure CORS for production domains
- [ ] Set up SMS provider for password reset codes
- [ ] Remove `debug_code` from password reset response
- [ ] Enable API rate limiting
- [ ] Set up proper image storage (S3, etc.)
- [ ] Configure backup for finished product images
- [ ] Test all API endpoints
- [ ] Provide API documentation to mobile developers

## Next Steps

1. **SMS Integration:** Replace cache-based password reset with actual SMS service
2. **Image Optimization:** Add image compression/resizing
3. **Push Notifications:** Notify clients of order status changes
4. **Payment Gateway:** Integrate payment processing for orders
5. **Analytics:** Track API usage and client behavior

## Support
For issues or questions, refer to:
- API Documentation: `docs/CLIENT_API_DOCUMENTATION.md`
- Laravel Sanctum Docs: https://laravel.com/docs/sanctum
- Inertia.js Docs: https://inertiajs.com

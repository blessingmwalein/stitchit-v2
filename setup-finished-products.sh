#!/bin/bash

# Stitchit ERP - Finished Products Setup Script
# Run this script to set up the new Finished Products and Client API features

echo "🎯 Stitchit ERP - Setting up Finished Products & Client API"
echo "============================================================"
echo ""

# Check if we're in the project root
if [ ! -f "artisan" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Run migrations
echo "📊 Step 1: Running migrations..."
php artisan migrate --force

if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

echo "✅ Migrations completed successfully"
echo ""

# Step 2: Clear caches
echo "🧹 Step 2: Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

echo "✅ Caches cleared"
echo ""

# Step 3: Create storage link
echo "🔗 Step 3: Creating storage link..."
php artisan storage:link

echo "✅ Storage link created"
echo ""

# Step 4: Compile assets (if needed)
echo "🎨 Step 4: Compiling frontend assets..."
if command -v npm &> /dev/null; then
    npm run build
    echo "✅ Assets compiled"
else
    echo "⚠️  npm not found, skipping asset compilation"
fi

echo ""
echo "============================================================"
echo "✨ Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Review the API documentation: docs/CLIENT_API_DOCUMENTATION.md"
echo "2. Test the API endpoints: docs/Stitchit_Client_API.postman_collection.json"
echo "3. Configure SANCTUM_STATEFUL_DOMAINS in .env for mobile apps"
echo "4. Test the production completion modal in the admin panel"
echo ""
echo "🧪 Quick Test:"
echo "curl -X POST http://localhost:8000/api/client/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"full_name\":\"Test\",\"phone\":\"+123\",\"password\":\"test123\",\"password_confirmation\":\"test123\"}'"
echo ""
echo "Happy coding! 🚀"

#!/bin/bash

# Stitchit ERP - Setup Script
# This script initializes the database and creates sample users

echo "╔═══════════════════════════════════════════════════╗"
echo "║        Stitchit ERP - Database Setup              ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    ./vendor/bin/sail artisan key:generate
    echo "✓ .env file created"
fi

echo "📦 Running migrations..."
./vendor/bin/sail  artisan migrate:fresh

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✓ Migrations completed"
echo ""
echo "👥 Seeding roles, permissions, and users..."
./vendor/bin/sail artisan db:seed

if [ $? -ne 0 ]; then
    echo "❌ Seeding failed!"
    exit 1
fi

echo ""
echo "✓ Database setup completed successfully!"
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║          🎉 Setup Complete!                       ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "📝 Sample users created:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  👤 Admin User"
echo "     Email:    admin@stitchit.com"
echo "     Password: password"
echo "     Role:     Administrator (Full Access)"
echo ""
echo "  👤 Manager"
echo "     Email:    manager@stitchit.com"
echo "     Password: password"
echo "     Role:     Manager (Most Permissions)"
echo ""
echo "  👤 Production Worker"
echo "     Email:    production@stitchit.com"
echo "     Password: password"
echo "     Role:     Production Staff"
echo ""
echo "  👤 Sales Representative"
echo "     Email:    sales@stitchit.com"
echo "     Password: password"
echo "     Role:     Sales Staff"
echo ""
echo "  👤 Test Admin (Quick Login)"
echo "     Email:    test@test.com"
echo "     Password: test"
echo "     Role:     Administrator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm install (if not done)"
echo "   2. Run: npm run dev"
echo "   3. Run: php artisan serve"
echo "   4. Visit: http://localhost:8000"
echo "   5. Login with any user above"
echo ""
echo "📚 Documentation: Check IMPLEMENTATION_PROGRESS.md"
echo ""

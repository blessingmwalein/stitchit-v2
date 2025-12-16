@echo off
REM Stitchit ERP - Setup Script for Windows
REM This script initializes the database and creates sample users

echo ========================================================
echo         Stitchit ERP - Database Setup
echo ========================================================
echo.

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found. Copying from .env.example...
    copy .env.example .env
    php artisan key:generate
    echo [OK] .env file created
)

echo [*] Running migrations...
php artisan migrate:fresh

if %errorlevel% neq 0 (
    echo [ERROR] Migration failed!
    exit /b 1
)

echo [OK] Migrations completed
echo.
echo [*] Seeding roles, permissions, and users...
php artisan db:seed

if %errorlevel% neq 0 (
    echo [ERROR] Seeding failed!
    exit /b 1
)

echo.
echo [OK] Database setup completed successfully!
echo.
echo ========================================================
echo          Setup Complete!
echo ========================================================
echo.
echo Sample users created:
echo --------------------------------------------------------
echo   Admin User
echo     Email:    admin@stitchit.com
echo     Password: password
echo     Role:     Administrator (Full Access)
echo.
echo   Manager
echo     Email:    manager@stitchit.com
echo     Password: password
echo     Role:     Manager (Most Permissions)
echo.
echo   Production Worker
echo     Email:    production@stitchit.com
echo     Password: password
echo     Role:     Production Staff
echo.
echo   Sales Representative
echo     Email:    sales@stitchit.com
echo     Password: password
echo     Role:     Sales Staff
echo.
echo   Test Admin (Quick Login)
echo     Email:    test@test.com
echo     Password: test
echo     Role:     Administrator
echo --------------------------------------------------------
echo.
echo Next steps:
echo   1. Run: npm install (if not done)
echo   2. Run: npm run dev
echo   3. Run: php artisan serve
echo   4. Visit: http://localhost:8000
echo   5. Login with any user above
echo.
echo Documentation: Check IMPLEMENTATION_PROGRESS.md
echo.
pause

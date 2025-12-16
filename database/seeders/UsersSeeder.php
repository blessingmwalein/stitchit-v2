<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@stitchit.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');
        $this->command->info('✓ Admin created: admin@stitchit.com / password');

        // Create Manager User
        $manager = User::firstOrCreate(
            ['email' => 'manager@stitchit.com'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $manager->assignRole('manager');
        $this->command->info('✓ Manager created: manager@stitchit.com / password');

        // Create Production User
        $production = User::firstOrCreate(
            ['email' => 'production@stitchit.com'],
            [
                'name' => 'Production Worker',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $production->assignRole('production');
        $this->command->info('✓ Production created: production@stitchit.com / password');

        // Create Sales User
        $sales = User::firstOrCreate(
            ['email' => 'sales@stitchit.com'],
            [
                'name' => 'Sales Representative',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $sales->assignRole('sales');
        $this->command->info('✓ Sales created: sales@stitchit.com / password');

        // Create Test Admin (easy to remember)
        $testAdmin = User::firstOrCreate(
            ['email' => 'test@test.com'],
            [
                'name' => 'Test Admin',
                'password' => Hash::make('test'),
                'email_verified_at' => now(),
            ]
        );
        $testAdmin->assignRole('admin');
        $this->command->info('✓ Test Admin created: test@test.com / test');

        $this->command->info('');
        $this->command->info('=== Sample Users Created ===');
        $this->command->info('Admin:      admin@stitchit.com / password');
        $this->command->info('Manager:    manager@stitchit.com / password');
        $this->command->info('Production: production@stitchit.com / password');
        $this->command->info('Sales:      sales@stitchit.com / password');
        $this->command->info('Test:       test@test.com / test');
        $this->command->info('===========================');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // Clients
            ['name' => 'clients.view', 'description' => 'View clients', 'group' => 'clients'],
            ['name' => 'clients.create', 'description' => 'Create clients', 'group' => 'clients'],
            ['name' => 'clients.update', 'description' => 'Update clients', 'group' => 'clients'],
            ['name' => 'clients.delete', 'description' => 'Delete clients', 'group' => 'clients'],

            // Orders
            ['name' => 'orders.view', 'description' => 'View orders', 'group' => 'orders'],
            ['name' => 'orders.create', 'description' => 'Create orders', 'group' => 'orders'],
            ['name' => 'orders.update', 'description' => 'Update orders', 'group' => 'orders'],
            ['name' => 'orders.delete', 'description' => 'Delete orders', 'group' => 'orders'],
            ['name' => 'orders.approve', 'description' => 'Approve orders', 'group' => 'orders'],
            ['name' => 'orders.payments', 'description' => 'Record payments', 'group' => 'orders'],

            // Inventory
            ['name' => 'inventory.view', 'description' => 'View inventory', 'group' => 'inventory'],
            ['name' => 'inventory.create', 'description' => 'Create inventory items', 'group' => 'inventory'],
            ['name' => 'inventory.update', 'description' => 'Update inventory items', 'group' => 'inventory'],
            ['name' => 'inventory.delete', 'description' => 'Delete inventory items', 'group' => 'inventory'],
            ['name' => 'inventory.adjust', 'description' => 'Adjust stock levels', 'group' => 'inventory'],

            // Production
            ['name' => 'production.view', 'description' => 'View production jobs', 'group' => 'production'],
            ['name' => 'production.create', 'description' => 'Create production jobs', 'group' => 'production'],
            ['name' => 'production.update', 'description' => 'Update production jobs', 'group' => 'production'],
            ['name' => 'production.delete', 'description' => 'Delete production jobs', 'group' => 'production'],
            ['name' => 'production.assign', 'description' => 'Assign production jobs', 'group' => 'production'],
            ['name' => 'production.materials', 'description' => 'Manage materials', 'group' => 'production'],

            // Purchases
            ['name' => 'purchases.view', 'description' => 'View purchase orders', 'group' => 'purchases'],
            ['name' => 'purchases.create', 'description' => 'Create purchase orders', 'group' => 'purchases'],
            ['name' => 'purchases.update', 'description' => 'Update purchase orders', 'group' => 'purchases'],
            ['name' => 'purchases.delete', 'description' => 'Delete purchase orders', 'group' => 'purchases'],
            ['name' => 'purchases.send', 'description' => 'Send to suppliers', 'group' => 'purchases'],
            ['name' => 'purchases.receive', 'description' => 'Receive goods', 'group' => 'purchases'],

            // Accounting
            ['name' => 'accounting.view', 'description' => 'View accounting', 'group' => 'accounting'],
            ['name' => 'accounting.expenses', 'description' => 'Manage expenses', 'group' => 'accounting'],
            ['name' => 'accounting.reports', 'description' => 'View reports', 'group' => 'accounting'],

            // Admin
            ['name' => 'admin.users', 'description' => 'Manage users', 'group' => 'admin'],
            ['name' => 'admin.roles', 'description' => 'Manage roles', 'group' => 'admin'],
            ['name' => 'admin.settings', 'description' => 'Manage settings', 'group' => 'admin'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Create Roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrator with full access']
        );

        $managerRole = Role::firstOrCreate(
            ['name' => 'manager'],
            ['description' => 'Manager with most permissions']
        );

        $productionRole = Role::firstOrCreate(
            ['name' => 'production'],
            ['description' => 'Production staff']
        );

        $salesRole = Role::firstOrCreate(
            ['name' => 'sales'],
            ['description' => 'Sales staff']
        );

        // Assign Permissions to Roles
        
        // Admin gets all permissions
        $adminRole->permissions()->sync(Permission::all());

        // Manager gets most permissions except admin
        $managerPermissions = Permission::where('group', '!=', 'admin')->get();
        $managerRole->permissions()->sync($managerPermissions);

        // Production staff permissions
        $productionPermissions = Permission::whereIn('name', [
            'production.view',
            'production.update',
            'production.materials',
            'inventory.view',
            'orders.view',
        ])->get();
        $productionRole->permissions()->sync($productionPermissions);

        // Sales staff permissions
        $salesPermissions = Permission::whereIn('name', [
            'clients.view',
            'clients.create',
            'clients.update',
            'orders.view',
            'orders.create',
            'orders.update',
            'orders.payments',
            'inventory.view',
        ])->get();
        $salesRole->permissions()->sync($salesPermissions);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}

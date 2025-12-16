<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use Illuminate\Support\Facades\DB;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing inventory items
        DB::table('inventory_items')->truncate();

        $materials = [
            // Tufting Cloth (Primary backing)
            [
                'sku' => 'TUF-CLOTH-001',
                'name' => 'Primary Tufting Cloth',
                'type' => 'tufting_cloth',
                'unit' => 'meters',
                'unit_cost' => 5.00,
                'current_stock' => 0,
                'reorder_point' => 10,
                'description' => 'Primary backing fabric for tufting frame',
                'is_active' => true,
            ],
            
            // Yarns (100g @ $2.00 each)
            [
                'sku' => 'YARN-WHITE-100G',
                'name' => 'Yarn - White',
                'type' => 'yarn',
                'color' => 'White',
                'unit' => 'grams',
                'unit_cost' => 0.02, // $2 per 100g = $0.02 per gram
                'current_stock' => 0,
                'reorder_point' => 500,
                'description' => '100g yarn bundle - White color',
                'metadata' => json_encode(['bundle_size' => 100]),
                'is_active' => true,
            ],
            [
                'sku' => 'YARN-BLACK-100G',
                'name' => 'Yarn - Black',
                'type' => 'yarn',
                'color' => 'Black',
                'unit' => 'grams',
                'unit_cost' => 0.02,
                'current_stock' => 0,
                'reorder_point' => 500,
                'description' => '100g yarn bundle - Black color',
                'metadata' => json_encode(['bundle_size' => 100]),
                'is_active' => true,
            ],
            [
                'sku' => 'YARN-RED-100G',
                'name' => 'Yarn - Red',
                'type' => 'yarn',
                'color' => 'Red',
                'unit' => 'grams',
                'unit_cost' => 0.02,
                'current_stock' => 0,
                'reorder_point' => 500,
                'description' => '100g yarn bundle - Red color',
                'metadata' => json_encode(['bundle_size' => 100]),
                'is_active' => true,
            ],
            [
                'sku' => 'YARN-BLUE-100G',
                'name' => 'Yarn - Blue',
                'type' => 'yarn',
                'color' => 'Blue',
                'unit' => 'grams',
                'unit_cost' => 0.02,
                'current_stock' => 0,
                'reorder_point' => 500,
                'description' => '100g yarn bundle - Blue color',
                'metadata' => json_encode(['bundle_size' => 100]),
                'is_active' => true,
            ],
            
            // Carpet Tile Vinyl / Backing Glue
            [
                'sku' => 'GLUE-BACKING-001',
                'name' => 'Carpet Tile Vinyl Backing Glue',
                'type' => 'backing_glue',
                'unit' => 'grams',
                'unit_cost' => 0.005, // Cost per gram
                'current_stock' => 0,
                'reorder_point' => 5000,
                'description' => 'Vinyl backing glue for carpet tiles',
                'is_active' => true,
            ],
            
            // Glue Sticks ($1.29 for pack of 8)
            [
                'sku' => 'GLUE-STICK-PACK8',
                'name' => 'Glue Sticks (Pack of 8)',
                'type' => 'glue_stick',
                'unit' => 'pieces',
                'unit_cost' => 0.16125, // $1.29 / 8 = $0.16125 per stick
                'current_stock' => 0,
                'reorder_point' => 50,
                'description' => 'Hot glue sticks - pack of 8 @ $1.29',
                'metadata' => json_encode(['pack_size' => 8, 'pack_cost' => 1.29]),
                'is_active' => true,
            ],
            
            // Backing Cloth
            [
                'sku' => 'BACK-CLOTH-001',
                'name' => 'Backing Cloth',
                'type' => 'backing_cloth',
                'unit' => 'meters',
                'unit_cost' => 3.50,
                'current_stock' => 0,
                'reorder_point' => 20,
                'description' => 'Finishing backing cloth for rugs',
                'is_active' => true,
            ],
        ];

        foreach ($materials as $material) {
            InventoryItem::create($material);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RugPricing;
use App\Models\RugPricingRecipeItem;
use App\Models\InventoryItem;

class RugPricingSeeder extends Seeder
{
    /**
     * Seed the rug pricing data with the 70x70cm example
     */
    public function run(): void
    {
        // First, ensure we have the necessary inventory items
        // These should already exist in your inventory, but we'll use existing or create placeholders
        
        // Find or create yarn item (example: 1000g costs $20, so unit_cost = $0.02 per gram)
        $yarn = InventoryItem::firstOrCreate(
            ['sku' => 'YARN-001'],
            [
                'name' => 'Rug Yarn',
                'type' => 'yarn',
                'color' => 'various',
                'unit' => 'grams',
                'unit_cost' => 0.02, // $20 per 1000g = $0.02 per gram
                'current_stock' => 10000,
                'reorder_point' => 1000,
                'is_active' => true,
            ]
        );

        // Tufting cloth (estimate unit cost per sqcm)
        $tuftingCloth = InventoryItem::firstOrCreate(
            ['sku' => 'CLOTH-TUFT-001'],
            [
                'name' => 'Tufting Cloth',
                'type' => 'tufting_cloth',
                'unit' => 'sqcm',
                'unit_cost' => 0.001, // Estimate: adjust based on actual costs
                'current_stock' => 500000,
                'reorder_point' => 10000,
                'is_active' => true,
            ]
        );

        // Backing cloth
        $backingCloth = InventoryItem::firstOrCreate(
            ['sku' => 'CLOTH-BACK-001'],
            [
                'name' => 'Backing Cloth',
                'type' => 'backing_cloth',
                'unit' => 'sqcm',
                'unit_cost' => 0.0008, // Estimate: adjust based on actual costs
                'current_stock' => 500000,
                'reorder_point' => 10000,
                'is_active' => true,
            ]
        );

        // Backing glue (1kg = $9, so unit_cost = $0.009 per gram)
        $backingGlue = InventoryItem::firstOrCreate(
            ['sku' => 'GLUE-BACK-001'],
            [
                'name' => 'Backing Glue',
                'type' => 'backing_glue',
                'unit' => 'grams',
                'unit_cost' => 0.009, // $9 per 1000g
                'current_stock' => 5000,
                'reorder_point' => 500,
                'is_active' => true,
            ]
        );

        // Glue sticks (packet of 8, estimate $8 per packet, so $1 per stick)
        $glueSticks = InventoryItem::firstOrCreate(
            ['sku' => 'GLUE-STICK-001'],
            [
                'name' => 'Glue Sticks',
                'type' => 'glue_stick',
                'unit' => 'pieces',
                'unit_cost' => 1.00, // $8 per packet of 8 = $1 per stick
                'current_stock' => 100,
                'reorder_point' => 20,
                'is_active' => true,
                'metadata' => ['pack_size' => 8], // 8 sticks per pack
            ]
        );

        // Create the pricing recipe for 70x70cm rug
        $recipe = RugPricing::create([
            'name' => 'Standard 70x70cm Rug Recipe',
            'description' => 'Basic pricing formula for standard rugs based on 70x70cm reference',
            'reference_width_cm' => 70,
            'reference_height_cm' => 70,
            'reference_price' => 50.00, // Base price for 70x70cm
            'min_price' => 45.00,
            'max_price' => 55.00,
            'profit_margin_percentage' => 25.00, // 25% profit margin
            'is_active' => true,
        ]);

        // For 70x70cm = 4900 sqcm
        $referenceSqcm = 70 * 70; // 4900 sqcm

        // Calculate quantities for each material based on the 70x70cm example
        
        // 1. Yarn: $20 for 1000g used for 70x70cm
        // Per sqcm: 1000g / 4900 sqcm ≈ 0.204 grams per sqcm
        RugPricingRecipeItem::create([
            'rug_pricing_recipe_id' => $recipe->id,
            'inventory_item_id' => $yarn->id,
            'calculation_type' => 'per_sqcm',
            'quantity' => 0.204, // grams per sqcm
            'unit' => 'grams',
            'notes' => 'Yarn usage based on 1000g for 70x70cm reference rug',
        ]);

        // 2. Tufting cloth: 1 sqcm of cloth per 1 sqcm of rug
        RugPricingRecipeItem::create([
            'rug_pricing_recipe_id' => $recipe->id,
            'inventory_item_id' => $tuftingCloth->id,
            'calculation_type' => 'per_sqcm',
            'quantity' => 1.0, // 1 sqcm per sqcm
            'unit' => 'sqcm',
            'notes' => 'Tufting cloth covers the entire rug area',
        ]);

        // 3. Backing cloth: 1 sqcm per rug sqcm
        RugPricingRecipeItem::create([
            'rug_pricing_recipe_id' => $recipe->id,
            'inventory_item_id' => $backingCloth->id,
            'calculation_type' => 'per_sqcm',
            'quantity' => 1.0, // 1 sqcm per sqcm
            'unit' => 'sqcm',
            'notes' => 'Backing cloth covers the entire rug area',
        ]);

        // 4. Backing glue: 500g for 70x70cm
        // Per sqcm: 500g / 4900 sqcm ≈ 0.102 grams per sqcm
        RugPricingRecipeItem::create([
            'rug_pricing_recipe_id' => $recipe->id,
            'inventory_item_id' => $backingGlue->id,
            'calculation_type' => 'per_sqcm',
            'quantity' => 0.102, // grams per sqcm
            'unit' => 'grams',
            'notes' => 'Backing glue usage based on 500g for 70x70cm reference',
        ]);

        // 5. Glue sticks: 5 sticks per rug (fixed, regardless of size for now)
        RugPricingRecipeItem::create([
            'rug_pricing_recipe_id' => $recipe->id,
            'inventory_item_id' => $glueSticks->id,
            'calculation_type' => 'per_rug',
            'quantity' => 5.0, // 5 sticks per rug
            'unit' => 'pieces',
            'notes' => 'Fixed 5 glue sticks per rug for binding',
        ]);

        $this->command->info('✓ Rug pricing recipe created successfully!');
        $this->command->info("  - Recipe: {$recipe->name}");
        $this->command->info("  - Reference: 70x70cm @ \${$recipe->reference_price}");
        $this->command->info("  - Materials: " . $recipe->items->count() . " items");
    }
}

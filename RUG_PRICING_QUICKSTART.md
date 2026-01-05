# Rug Pricing Module - Quick Start Guide

## Installation Steps

### 1. Run Migrations
```bash
php artisan migrate
```

This creates:
- `rug_pricing_recipes` table
- `rug_pricing_recipe_items` table

### 2. (Optional) Seed Sample Data
```bash
php artisan db:seed --class=RugPricingSeeder
```

This creates a sample recipe based on your 70x70cm rug specification.

### 3. Access the Module

**Admin Panel:**
- List recipes: `http://your-domain/admin/rug-pricing`
- Calculator: `http://your-domain/admin/rug-pricing/calculator`

**Client API:**
```bash
# Calculate price
curl -X POST http://your-domain/api/client/public/rug-pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{"width_cm": 100, "height_cm": 120}'
```

## Quick Recipe Creation

### Step 1: Check Your Inventory
Make sure you have these inventory items with accurate unit costs:
1. Yarn (unit: grams)
2. Tufting Cloth (unit: sqcm)
3. Backing Cloth (unit: sqcm)
4. Backing Glue (unit: grams)
5. Glue Sticks (unit: pieces)

### Step 2: Create Recipe
1. Go to `/admin/rug-pricing`
2. Click "New Recipe"
3. Fill in:
   - Name: "Standard Rug Recipe"
   - Reference: 70x70cm @ $50
   - Profit margin: 25%

### Step 3: Add Materials

**For 70x70cm = 4,900 sqcm**

| Material | Type | Quantity | Calculation |
|----------|------|----------|-------------|
| Yarn | Per Sq.Cm | 0.204 | 1000g ÷ 4900 |
| Tufting Cloth | Per Sq.Cm | 1.0 | 1:1 coverage |
| Backing Cloth | Per Sq.Cm | 1.0 | 1:1 coverage |
| Backing Glue | Per Sq.Cm | 0.102 | 500g ÷ 4900 |
| Glue Sticks | Per Rug | 5.0 | Fixed amount |

### Step 4: Test Calculator
1. Go to `/admin/rug-pricing/calculator`
2. Enter: 70cm × 70cm
3. Verify the calculated price is close to $50
4. Adjust material quantities or unit costs if needed

## API Integration Example

### JavaScript/TypeScript
```typescript
async function calculateRugPrice(width: number, height: number) {
  const response = await fetch('/api/client/public/rug-pricing/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      width_cm: width,
      height_cm: height,
    }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Final Price:', data.data.pricing.final_price);
    console.log('Production Cost:', data.data.pricing.production_cost);
    return data.data;
  }
}

// Usage
const price = await calculateRugPrice(100, 120);
```

### PHP
```php
use App\Services\RugPricingService;

$rugPricingService = app(RugPricingService::class);

$result = $rugPricingService->calculateFinalPrice(
    recipeId: 1,
    widthCm: 100,
    heightCm: 120,
    profitMarginPercent: 25
);

echo "Final Price: $" . $result['final_price'];
```

## Troubleshooting

### "No active pricing recipe found"
**Solution:** Create a recipe and mark it as active.

### Calculated price is very different from expected
**Solution:** 
1. Check inventory `unit_cost` values
2. Verify quantity calculations (especially per_sqcm)
3. Review profit margin percentage

### Recipe items not showing
**Solution:** Reload the recipe relationship:
```php
$recipe = RugPricing::with('items.inventoryItem')->find($id);
```

## File Structure
```
app/
├── Http/Controllers/
│   ├── RugPricingController.php
│   └── Api/ClientRugPricingController.php
├── Models/
│   ├── RugPricing.php
│   └── RugPricingRecipeItem.php
├── Repositories/
│   ├── RugPricingRepository.php
│   ├── RugPricingRecipeItemRepository.php
│   └── InventoryItemRepository.php
└── Services/
    └── RugPricingService.php

database/
├── migrations/
│   ├── 2026_01_04_000001_create_rug_pricing_recipes_table.php
│   └── 2026_01_04_000002_create_rug_pricing_recipe_items_table.php
└── seeders/
    └── RugPricingSeeder.php

resources/js/pages/rug-pricing/
├── index.tsx
├── create.tsx
├── edit.tsx
└── calculator.tsx

routes/
├── web.php (admin routes)
└── api-client.php (client API routes)
```

## Next Steps
1. ✅ Run migrations
2. ✅ Seed sample data (optional)
3. ✅ Update inventory unit costs
4. ✅ Create your first recipe
5. ✅ Test the calculator
6. ✅ Integrate API into mobile app
7. ✅ Train staff on using the system

## Support
See full documentation in `docs/RUG_PRICING_MODULE.md`

# Rug Pricing Module Documentation

## Overview
The Rug Pricing Module provides a comprehensive system for managing rug production costs and calculating accurate pricing based on dimensions. It uses a recipe-based approach where you define materials and their usage patterns to automatically calculate costs for any rug size.

## Features
- ✅ Recipe-based pricing formulas
- ✅ Material cost tracking per square centimeter
- ✅ Multiple calculation types (per sqcm, per rug, fixed amount)
- ✅ Profit margin management
- ✅ Reference pricing calibration
- ✅ Real-time price calculator
- ✅ Client API for quotes
- ✅ Cost breakdown analysis

## Database Structure

### Tables
1. **rug_pricing_recipes** - Main recipe definitions
2. **rug_pricing_recipe_items** - Materials used in each recipe

### Key Fields
- `reference_width_cm` / `reference_height_cm` - Calibration dimensions (e.g., 70x70cm)
- `reference_price` - Known market price for reference size
- `profit_margin_percentage` - Default profit margin
- `calculation_type` - How material is calculated:
  - `per_sqcm` - Scales with rug area
  - `per_rug` - Fixed amount per rug
  - `fixed_amount` - Absolute cost value

## Setup Instructions

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Seed Sample Data (Optional)
```bash
php artisan db:seed --class=RugPricingSeeder
```

This creates a sample recipe based on your 70x70cm rug specification with:
- Yarn: 1000g @ $20 ($0.02/g)
- Tufting cloth
- Backing cloth
- Backing glue: 500g @ $9/kg
- Glue sticks: 5 per rug @ $1/stick

### 3. Configure Your Inventory
Before creating recipes, ensure your inventory items have accurate `unit_cost` values:
- Go to Inventory Management
- Update unit costs for:
  - Yarn (cost per gram)
  - Tufting cloth (cost per sqcm)
  - Backing cloth (cost per sqcm)
  - Backing glue (cost per gram)
  - Glue sticks (cost per piece)

## Usage Guide

### Creating a Pricing Recipe

1. **Navigate to Rug Pricing**
   - Go to `/admin/rug-pricing`
   - Click "New Recipe"

2. **Enter Basic Information**
   - Name: e.g., "Standard Rug Recipe"
   - Description: Brief explanation
   - Mark as Active

3. **Set Reference Data** (Important for calibration)
   - Reference Width: 70 cm
   - Reference Height: 70 cm
   - Reference Price: $50 (your known selling price)
   - Profit Margin: 25% (adjust as needed)
   - Min/Max prices: $45-$55

4. **Add Materials**

   **Yarn Example:**
   - Material: Select "Rug Yarn"
   - Calculation Type: "Per Sq.Cm"
   - Quantity: 0.204 (= 1000g ÷ 4900 sqcm)
   - Unit: grams
   - Notes: "Based on 1000g for 70x70cm"

   **Tufting/Backing Cloth:**
   - Material: Select cloth
   - Calculation Type: "Per Sq.Cm"
   - Quantity: 1.0 (covers entire surface)
   - Unit: sqcm

   **Backing Glue:**
   - Material: Select glue
   - Calculation Type: "Per Sq.Cm"
   - Quantity: 0.102 (= 500g ÷ 4900 sqcm)
   - Unit: grams

   **Glue Sticks:**
   - Material: Select glue sticks
   - Calculation Type: "Per Rug"
   - Quantity: 5
   - Unit: pieces
   - Notes: "Fixed 5 sticks regardless of size"

5. **Save Recipe**

### Using the Price Calculator

1. **Navigate to Calculator**
   - Go to `/admin/rug-pricing/calculator`

2. **Select Recipe**
   - Choose your active pricing recipe

3. **Enter Dimensions**
   - Width: e.g., 100 cm
   - Height: e.g., 120 cm
   - Profit Margin: Override if needed

4. **Calculate**
   - Click "Calculate Price"
   - View detailed breakdown:
     - Material costs per item
     - Total production cost
     - Cost per sqcm
     - Profit amount
     - Final price

## API Endpoints

### Admin Routes
```
GET    /admin/rug-pricing              - List all recipes
GET    /admin/rug-pricing/create       - Create recipe form
POST   /admin/rug-pricing              - Store new recipe
GET    /admin/rug-pricing/{id}         - Edit recipe
PUT    /admin/rug-pricing/{id}         - Update recipe
DELETE /admin/rug-pricing/{id}         - Delete recipe
GET    /admin/rug-pricing/calculator   - Calculator page
POST   /admin/rug-pricing/calculate    - Calculate price
GET    /admin/rug-pricing/{id}/analyze - Analyze reference data
```

### Client API Routes
```
POST /api/client/public/rug-pricing/calculate
```

**Request:**
```json
{
  "width_cm": 100,
  "height_cm": 120,
  "recipe_id": 1  // Optional, uses default if not specified
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dimensions": {
      "width_cm": 100,
      "height_cm": 120,
      "area_sqcm": 12000
    },
    "pricing": {
      "production_cost": 35.50,
      "profit_margin_percentage": 25,
      "profit_amount": 8.88,
      "final_price": 44.38,
      "currency": "USD"
    }
  }
}
```

**Get Cost Breakdown:**
```
GET /api/client/rug-pricing/breakdown?width_cm=100&height_cm=120
```

Returns detailed material breakdown.

## Calculation Logic

### Per Square Centimeter (per_sqcm)
```
item_cost = area_sqcm × quantity × unit_cost
```
Example: Yarn for 100x120cm rug
- Area: 12,000 sqcm
- Quantity: 0.204 g/sqcm
- Unit cost: $0.02/g
- Total: 12,000 × 0.204 × 0.02 = $48.96

### Per Rug (per_rug)
```
item_cost = quantity × unit_cost
```
Example: Glue sticks
- Quantity: 5 sticks
- Unit cost: $1/stick
- Total: 5 × 1 = $5.00

### Fixed Amount (fixed_amount)
```
item_cost = quantity
```
Example: Fixed overhead
- Quantity: 10
- Total: $10.00

### Final Price Calculation
```
total_material_cost = sum(all item_costs)
profit_amount = total_material_cost × (profit_margin_percentage / 100)
final_price = total_material_cost + profit_amount
```

## Calibration Tips

1. **Start with Known Reference**
   - Use a rug you've made and know the actual cost
   - Set reference dimensions and price

2. **Accurate Inventory Costs**
   - Keep inventory unit_cost updated
   - Use average costs if prices vary

3. **Test Calculations**
   - Calculate your reference size
   - Compare with actual costs
   - Adjust quantities if needed

4. **Profit Margin**
   - Consider overhead costs
   - Factor in labor (not in material cost)
   - Account for complexity variations

## Example: 70x70cm Rug Breakdown

**Reference Rug:**
- Dimensions: 70 × 70 cm (4,900 sqcm)
- Market Price: $50
- Target Production Cost: ~$37.50 (for 25% margin)

**Material Costs:**
- Yarn: 1000g × $0.02 = $20.00
- Tufting Cloth: 4900 sqcm × $0.001 = $4.90
- Backing Cloth: 4900 sqcm × $0.0008 = $3.92
- Backing Glue: 500g × $0.009 = $4.50
- Glue Sticks: 5 × $1.00 = $5.00
- **Total Material Cost: $38.32**

**Pricing:**
- Production Cost: $38.32
- Profit (25%): $9.58
- **Final Price: $47.90**

If your reference price is $50, you're close! Adjust material quantities or unit costs to calibrate perfectly.

## Architecture

### Repository Pattern
- `RugPricingRepository` - Recipe CRUD operations
- `RugPricingRecipeItemRepository` - Material item management
- `InventoryItemRepository` - Inventory queries

### Service Pattern
- `RugPricingService` - Business logic layer
  - Recipe management
  - Cost calculations
  - Price calculations
  - Formula calibration

### Controllers
- `RugPricingController` - Admin interface (no business logic)
- `ClientRugPricingController` - Client API (no business logic)

All business logic is in the service layer, following your requirement for clean controllers.

## Frontend Components

### Pages
- `pages/rug-pricing/index.tsx` - Recipe list
- `pages/rug-pricing/create.tsx` - Recipe creation
- `pages/rug-pricing/calculator.tsx` - Price calculator

## Troubleshooting

**Issue: Calculated price doesn't match reference**
- Solution: Check inventory unit_cost values
- Verify quantity calculations (per sqcm values)
- Review profit margin setting

**Issue: No recipes available**
- Solution: Create a recipe or run seeder
- Check `is_active` status

**Issue: API returns 404**
- Solution: Ensure routes are registered
- Check recipe exists and is active

## Next Steps

1. **Run migrations and seeder** to set up the database
2. **Update inventory unit costs** with actual values
3. **Create your first recipe** using the web interface
4. **Test the calculator** with known rug sizes
5. **Calibrate** by comparing calculated vs actual costs
6. **Integrate** the client API into your mobile app

## Support

For questions or issues, check:
- Migration files in `database/migrations/2026_01_04_*`
- Models in `app/Models/RugPricing*.php`
- Service in `app/Services/RugPricingService.php`

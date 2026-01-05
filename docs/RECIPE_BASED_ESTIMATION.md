# Recipe-Based Material Estimation System

## Overview

The Recipe-Based Material Estimation system links Production Jobs with the Rug Pricing Recipe model to automatically calculate material requirements based on job dimensions. This system enables comparison between estimated and actual material usage to improve pricing algorithms.

## Key Features

### 1. **Automated Material Estimation**
- Calculate material requirements from active recipes
- Use job order dimensions (width × height in cm)
- Support different calculation types:
  - `per_sqcm`: Scales proportionally with rug area
  - `per_rug`: Fixed quantity per rug regardless of size
  - `fixed_amount`: Fixed cost amount

### 2. **Yarn Color Allocation**
- For yarn materials, the system calculates total grams needed
- Converts to balls (default: 100g per ball)
- Allows users to allocate yarn across multiple colors
- Example: 1000g total = 10 balls
  - 6 balls of Red (#FF0000)
  - 4 balls of Blue (#0000FF)

### 3. **Estimate vs Actual Tracking**
- Stores estimates as `MaterialConsumption` with `type='estimated'`
- Compares with actual usage (`type='actual'`)
- Tracks variances for algorithm improvement
- Helps refine pricing formulas over time

## Components

### Backend

#### Routes (`routes/web.php`)
```php
Route::post('production/estimate-materials', [ProductionController::class, 'estimateMaterials'])
Route::post('production/{id}/estimate', [ProductionController::class, 'saveEstimate'])
Route::post('production/{id}/complete', [ProductionController::class, 'complete'])
```

#### Controller Methods (`ProductionController.php`)

**`estimateMaterials()`**
- Input: `recipe_id`, `width_cm`, `height_cm`
- Calculates material quantities using recipe formulas
- Returns materials with inventory details and category information
- For yarn, calculates balls needed (total_grams / 100)

**`saveEstimate()`**
- Saves estimated materials to production job
- Creates `MaterialConsumption` records with `type='estimated'`
- Updates job's `estimated_material_cost` and `estimated_labor_hours`
- Replaces any existing estimates

**`complete()`**
- Transitions job to COMPLETED state
- Records actual labor hours
- Creates cost snapshot for analysis
- Records production costs in accounting system

#### Service Methods (`ProductionService.php`)

**`saveEstimates()`**
```php
public function saveEstimates(int $jobId, array $data): ProductionJob
```
- Deletes existing estimated materials
- Creates new estimated materials from recipe calculation
- Updates estimated costs on production job
- Returns fresh job with relationships

**`completeJob()`**
```php
public function completeJob(int $jobId, array $data): ProductionJob
```
- Validates job is in QUALITY_CHECK state
- Records actual labor hours and quality notes
- Creates cost snapshot
- Triggers accounting entry

### Frontend

#### EstimateMaterialsModal (`EstimateMaterialsModal.tsx`)

**Features:**
- Recipe selection dropdown (active recipes only)
- Auto-calculates materials on "Calculate" button click
- Displays all materials with quantities and costs
- **Yarn Color Allocation:**
  - Shows balls needed for yarn materials
  - Add/remove color allocations
  - Select specific yarn colors from inventory
  - Input number of balls per color
  - Auto-converts balls to grams (balls × 100)
  - Validates total allocated balls match required balls
  - Color-coded status: green when matched, orange when not
- Labor hours estimation
- Total estimated cost summary

**Usage:**
```tsx
<EstimateMaterialsModal
  open={showEstimateModal}
  onClose={() => setShowEstimateModal(false)}
  jobId={jobId}
  jobDimensions={{
    width: job.order_item.width,
    height: job.order_item.height,
  }}
  onSuccess={fetchJobDetails}
/>
```

#### ProductionDetailDrawer Updates

Added "Estimate Materials from Recipe" button in the Estimated tab:
```tsx
<Button 
  variant="outline" 
  size="sm" 
  className="mt-4"
  onClick={() => setShowEstimateModal(true)}
>
  + Estimate Materials from Recipe
</Button>
```

## Data Flow

### 1. Recipe Selection & Calculation
```
User selects recipe → Click "Calculate" →
Backend calculates materials based on job dimensions →
Returns materials with quantities, costs, and inventory details
```

### 2. Yarn Allocation (Example)
```
Recipe calculation: 1000g yarn needed → 10 balls

User allocates:
- Select "Yarn - Red" → 6 balls → 600g
- Select "Yarn - Blue" → 4 balls → 400g
Total: 10 balls = 1000g ✓
```

### 3. Save Estimates
```
User clicks "Save Estimates" →
Backend creates MaterialConsumption records:
  - inventory_item_id: 123 (Yarn - Red)
  - type: 'estimated'
  - consumed_quantity: 600
  - unit_cost: from inventory
  - total_cost: calculated

Updates production job:
  - estimated_material_cost: sum of all materials
  - estimated_labor_hours: user input
```

### 4. Compare Estimates vs Actual
```
During production:
- Add actual materials used (type='actual')

After completion:
- estimated_material_cost vs actual_material_cost
- estimated_labor_hours vs actual_labor_hours
- Variance analysis for pricing improvement
```

## Calculation Examples

### Example 1: Yarn (per_sqcm calculation)

**Reference Recipe:**
- Reference dimensions: 100cm × 100cm = 10,000 cm²
- Yarn quantity in recipe: 800g for reference rug

**New Job:**
- Job dimensions: 150cm × 200cm = 30,000 cm²

**Calculation:**
```
Ratio = 800g / 10,000 cm² = 0.08g per cm²
New quantity = 30,000 cm² × 0.08 = 2,400g
Balls needed = ceil(2,400 / 100) = 24 balls
```

**User Allocation:**
- 12 balls of Yarn - Navy Blue
- 8 balls of Yarn - White
- 4 balls of Yarn - Gold
Total: 24 balls ✓

### Example 2: Backing Material (per_rug calculation)

**Reference Recipe:**
- Backing fabric: 1 unit per rug (fixed)

**New Job:**
- Any dimensions

**Calculation:**
```
Quantity = 1 unit (unchanged)
Cost = 1 × unit_cost
```

## Database Schema

### material_consumptions

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| production_job_id | bigint | Foreign key to production_jobs |
| inventory_item_id | bigint | Foreign key to inventory_items |
| type | enum | 'estimated' or 'actual' |
| consumed_quantity | decimal | Quantity used (in item's unit) |
| waste_quantity | decimal | Waste amount |
| unit_cost | decimal | Cost per unit at time of consumption |
| total_cost | decimal | Total cost (quantity × unit_cost) |

### rug_pricing_recipe_items

| Column | Type | Description |
|--------|------|-------------|
| rug_pricing_recipe_id | bigint | Foreign key to rug_recipes |
| inventory_item_id | bigint | Foreign key to inventory_items |
| calculation_type | enum | 'per_sqcm', 'per_rug', 'fixed_amount' |
| quantity | decimal | Quantity for reference rug |
| unit | string | Unit of measurement |

## Benefits

### 1. **Accurate Cost Estimation**
- Calculate material costs before starting production
- Make informed decisions about pricing
- Identify material requirements early

### 2. **Inventory Planning**
- Know exactly what materials and colors are needed
- Plan purchases in advance
- Reduce material shortages

### 3. **Algorithm Improvement**
- Compare estimated vs actual usage
- Identify patterns in material consumption
- Refine recipe calculations over time
- Improve pricing accuracy

### 4. **Color Management for Yarn**
- Flexible allocation across multiple colors
- Track specific colors used per project
- Better inventory management per color variant

### 5. **Production Efficiency**
- Pre-allocate materials based on estimates
- Reduce production delays
- Track material usage variances

## Usage Workflow

1. **Create Production Job** from approved order
2. **Open Production Detail Drawer**
3. **Navigate to "Estimated" tab**
4. **Click "Estimate Materials from Recipe"**
5. **Select active recipe** (auto-selected if only one)
6. **Click "Calculate"** to compute materials
7. **Review materials list**
8. **For yarn items:**
   - Review balls needed
   - Click "+ Add Color" to allocate
   - Select specific yarn color from dropdown
   - Enter number of balls
   - Repeat until all balls allocated
9. **Adjust estimated labor hours**
10. **Click "Save Estimates"**
11. **Production proceeds with material guidance**
12. **Record actual materials used** during production
13. **Complete job** with actual labor hours
14. **System compares estimates vs actuals** for analysis

## Future Enhancements

- [ ] Automatic color suggestions based on design image
- [ ] Machine learning for improved material predictions
- [ ] Historical data analysis for recipe refinement
- [ ] Waste percentage recommendations per material type
- [ ] Bulk estimation for multiple jobs
- [ ] Material substitute suggestions when inventory low
- [ ] Cost variance alerts and notifications
- [ ] Recipe versioning to track formula changes

## Technical Notes

- All calculations preserve the recipe's calculation type
- Yarn ball size is configurable (default: 100g)
- Color allocations are stored as separate MaterialConsumption records
- Estimates can be regenerated/updated before production starts
- Once job moves beyond PLANNED state, estimates are locked for comparison
- Actual materials are tracked separately to maintain estimate integrity

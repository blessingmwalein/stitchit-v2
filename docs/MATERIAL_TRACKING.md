# Production Material Tracking & Estimation System

## Overview

This system provides comprehensive material tracking and estimation for rug production, including:

- **Automatic Material Estimation**: Based on rug dimensions (cm) and material consumption rates
- **Actual Material Tracking**: Easy-to-use interface for recording real material usage
- **Variance Analysis**: Compare estimated vs actual costs
- **Inventory Integration**: Automatic stock updates when materials are consumed

## Material Types Tracked

1. **Tufting Cloth** (sqm) - Primary backing material
2. **Yarn** (grams) - Various colors for the rug design
3. **Backing Cloth** (sqm) - Secondary backing layer
4. **Backing Glue** (grams) - Adhesive for backing
5. **Hot Glue Sticks** (grams) - For finishing

## Material Consumption Rates

Configured in `MaterialEstimationService.php`:

- **Tufting Cloth**: 1.15x area (15% waste allowance)
- **Yarn**: 2,500g per sqm (varies by pile height)
- **Backing Cloth**: 1.10x area (10% waste allowance)
- **Backing Glue**: 800g per sqm
- **Hot Glue Sticks**: 50g per sqm

## How It Works

### 1. Production Job Creation

When a production job is created:
```php
// Auto-generates material estimates based on order dimensions
$job = ProductionService::create($data);
// Estimates are automatically saved to material_consumptions table with type='estimated'
```

### 2. Material Estimation Logic

```
Area (sqm) = (Width_cm × Height_cm) / 10,000
Total Area = Area × Quantity

For each material:
Estimated Quantity = Total Area × Consumption Rate
Estimated Cost = Estimated Quantity × Unit Cost
```

### 3. Recording Actual Materials

During production, workers record actual materials used:

**UI Flow**:
1. Open Production Job Detail Drawer
2. Go to "Actual" tab
3. Click "Add Material" button
4. Select material from dropdown
5. Enter used quantity and waste
6. System shows real-time cost calculation
7. Click "Add Material"

**Backend Process**:
```php
MaterialConsumption::create([
    'type' => 'actual',
    'quantity' => $consumedQuantity,
    'waste_quantity' => $wasteQuantity,
    'unit_cost' => $inventoryItem->unit_cost,
    'total_cost' => ($consumedQuantity + $wasteQuantity) * $unit_cost
]);

// Update inventory
Inventory::updateStock($itemId, -$totalQuantity);

// Recalculate job's actual_material_cost
```

### 4. Update/Delete Materials

- **Edit**: Click edit icon → Update quantities → Save
- **Delete**: Click trash icon → Inventory is restored

## API Endpoints

```php
// Add actual material
POST /admin/production/{id}/consume
{
    "inventory_item_id": 123,
    "consumed_quantity": 5.5,
    "waste_quantity": 0.5,
    "notes": "Optional notes"
}

// Update material
PUT /admin/production/{id}/consume/{consumptionId}
{
    "consumed_quantity": 6.0,
    "waste_quantity": 0.3
}

// Delete material
DELETE /admin/production/{id}/consume/{consumptionId}
```

## Database Schema

### material_consumptions Table

```sql
- production_job_id: FK to production_jobs
- inventory_item_id: FK to inventory_items
- type: ENUM('estimated', 'actual')
- quantity: DECIMAL - Amount used (not including waste)
- unit_cost: DECIMAL - Cost per unit at time of recording
- total_cost: DECIMAL - (quantity + waste_quantity) * unit_cost
- waste_quantity: DECIMAL - Waste/scrap amount
- recorded_by: FK to users
- recorded_at: TIMESTAMP
- notes: TEXT
```

## UI Components

### AddMaterialModal
**Location**: `resources/js/components/modals/AddMaterialModal.tsx`

Features:
- Material selection with stock availability
- Real-time cost calculation
- Unit display based on material type
- Waste tracking
- Notes field

### ProductionDetailDrawer
**Location**: `resources/js/components/drawers/ProductionDetailDrawer.tsx`

Tabs:
- **Details**: Job information
- **Estimated**: Auto-generated estimates
- **Actual**: Material usage recording with edit/delete

## Services

### MaterialEstimationService
**Location**: `app/Services/MaterialEstimationService.php`

Methods:
- `estimateForJob(ProductionJob $job)`: Calculate estimates
- `saveEstimates()`: Save estimates to database
- `autoGenerateEstimates()`: Generate if not exists
- `calculateVariance()`: Compare estimated vs actual

### ProductionService
**Location**: `app/Services/ProductionService.php`

Methods:
- `addActualMaterial()`: Record material usage
- `updateActualMaterial()`: Edit existing record
- `deleteActualMaterial()`: Remove record & restore inventory
- `updateActualCost()`: Recalculate job's total cost

## Customization

### Adjust Consumption Rates

Edit `MaterialEstimationService.php`:

```php
const TUFTING_CLOTH_RATE = 1.15; // Change to 1.20 for 20% waste
const YARN_RATE_PER_SQM = 2500; // Adjust based on your pile height
```

### Add New Material Types

1. Add to inventory with appropriate type
2. Update `MaterialEstimationService::estimateForJob()` to include new material
3. Define consumption rate constant

## Reporting & Analytics

### Variance Analysis

```php
$variance = MaterialEstimationService::calculateVariance($job);

// Returns:
[
    'estimated_cost' => 500.00,
    'actual_cost' => 475.50,
    'variance' => -24.50,  // Negative = under budget
    'variance_percent' => -4.9
]
```

### Cost Tracking

- `estimated_material_cost`: Sum of all estimated consumptions
- `actual_material_cost`: Sum of all actual consumptions
- Updated automatically when materials are added/edited

## Workflow Example

1. **Order Created**: Client orders 120cm × 180cm rug (qty: 1)
2. **Production Job Created**: System calculates area = 2.16 sqm
3. **Auto-Estimation**: 
   - Tufting Cloth: 2.49 sqm
   - Yarn (Red): 1,250g
   - Yarn (Blue): 1,250g
   - Backing Cloth: 2.38 sqm
   - Backing Glue: 1,728g
   - Hot Glue: 108g
   - **Total Estimated Cost**: $187.50

4. **During Production**: Workers record actual usage:
   - Click "Add Material" → Select "Tufting Cloth" → 2.5 sqm used, 0.1 waste
   - Repeat for each material

5. **Completion**: Compare actual vs estimated costs

## Best Practices

1. **Record materials immediately** after use for accuracy
2. **Track waste separately** to identify efficiency opportunities
3. **Review variances** regularly to adjust estimation rates
4. **Use notes field** to document special circumstances
5. **Train production staff** on the UI for consistent data

## Future Enhancements

- Barcode scanning for quick material selection
- Mobile app for shop floor recording
- Batch material allocation (allocate all at once)
- Historical variance analysis reports
- Predictive estimation based on design complexity
- Material substitution tracking

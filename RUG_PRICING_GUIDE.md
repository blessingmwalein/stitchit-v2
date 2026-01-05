# Rug Pricing Recipe Guide

## How to Enter Recipe Values Correctly

### Understanding Calculation Types

#### 1. **Per Sq.Cm** (Scales with rug size)
Use this for materials where the amount needed increases with rug size (cloth, yarn, glue).

**Important:** Enter the quantity needed **per 1 square centimeter**, NOT the total for your reference rug!

**Example - Backing Cloth for 70×70cm rug:**
- Reference rug: 70×70 = 4,900 cm²
- Total backing needed: 4,900 cm²
- **Quantity to enter:** 4,900 ÷ 4,900 = **1.0000** (1 cm² of cloth per 1 cm² of rug)
- Unit cost: $0.0003 per cm²

**Formula:** `Area × Quantity × Unit Cost`
- For 70×70cm: `4,900 × 1.0 × $0.0003 = $1.47`

#### 2. **Per Rug** (Fixed quantity regardless of size)
Use this for items that don't scale with size (glue sticks, fixed labor).

**Example - Glue Sticks:**
- You need 5 glue sticks for ANY rug size
- **Quantity to enter:** **5.0000**
- Unit cost: $0.16 per stick

**Formula:** `Quantity × Unit Cost`
- For any size: `5 × $0.16 = $0.80`

#### 3. **Fixed Amount** (Direct dollar amount)
Use this for fixed costs like packaging or labor fees.

**Example - Packaging:**
- **Quantity to enter:** **2.50** (represents $2.50)

**Formula:** The quantity IS the cost
- For any size: `$2.50`

---

## Correct Recipe for Your 70×70cm Example

For a 70×70cm rug (4,900 cm²) with $50 target price:

### Materials:

1. **Backing Cloth**
   - Calculation Type: Per Sq.Cm
   - Quantity: **1.0000** (1 cm² per cm²)
   - Unit: sqcm
   - Unit Cost: $0.0003/sqcm
   - **Total for 70×70:** 4,900 × 1.0 × $0.0003 = **$1.47**

2. **Tufting Cloth**
   - Calculation Type: Per Sq.Cm
   - Quantity: **1.0000** (1 cm² per cm²)
   - Unit: sqcm
   - Unit Cost: $0.0003/sqcm
   - **Total for 70×70:** 4,900 × 1.0 × $0.0003 = **$1.47**

3. **Rug Yarn**
   - Calculation Type: Per Sq.Cm
   - Quantity: **0.2041** (1,000g ÷ 4,900 cm²)
   - Unit: grams
   - Unit Cost: $0.0200/gram
   - **Total for 70×70:** 4,900 × 0.2041 × $0.02 = **$20.00**

4. **Backing Glue**
   - Calculation Type: Per Sq.Cm
   - Quantity: **0.0816** (400g ÷ 4,900 cm²)
   - Unit: g
   - Unit Cost: $0.0980/g
   - **Total for 70×70:** 4,900 × 0.0816 × $0.098 = **$39.18**

5. **Glue Sticks**
   - Calculation Type: **Per Rug** (doesn't scale!)
   - Quantity: **5.0000**
   - Unit: piece
   - Unit Cost: $0.1600/piece
   - **Total for ANY size:** 5 × $0.16 = **$0.80**

### Summary for 70×70cm:
- Material Cost: $1.47 + $1.47 + $20.00 + $39.18 + $0.80 = **$62.92**
- Profit (20%): $62.92 × 0.20 = **$12.58**
- Final Price: $62.92 + $12.58 = **$75.50** ✓

---

## Quick Reference Table

| Material | Type | How to Calculate Quantity |
|----------|------|--------------------------|
| Cloth/Fabric | Per Sq.Cm | Total needed ÷ Reference area |
| Yarn/Thread | Per Sq.Cm | Total grams ÷ Reference area |
| Glue (liquid) | Per Sq.Cm | Total grams ÷ Reference area |
| Glue Sticks | Per Rug | Just the count (e.g., 5) |
| Packaging | Fixed Amount | Dollar amount (e.g., 2.50) |

## Formula Reminder

- **Per Sq.Cm:** `Rug Area × Quantity per cm² × Unit Cost = Total Cost`
- **Per Rug:** `Quantity × Unit Cost = Total Cost`
- **Fixed Amount:** `Quantity = Total Cost`

# Inventory & Purchases Module - Complete Implementation Plan

## Current State Analysis

### ✅ Already Implemented (Backend)
- **Inventory**:
  - Full CRUD operations (InventoryController, InventoryService, InventoryRepository)
  - Stock adjustment functionality
  - Reorder point tracking
  - Average cost calculation
  - Types: yarn, tufting_cloth, backing_cloth, glue, glue_stick, accessory
  
- **Purchases**:
  - Full CRUD operations (PurchaseController, PurchaseService, PurchaseRepository)
  - States: DRAFT → SENT → PARTIALLY_RECEIVED → FULLY_RECEIVED → CLOSED
  - Goods receiving functionality
  - Stock lot creation
  - Supplier management

### ✅ Already Implemented (Frontend)
- **Inventory**:
  - Index page with DataTable
  - Create/Edit modal (InventoryModal)
  - Redux slice with all actions
  - Delete functionality with notifications
  
- **Purchases**:
  - Index page with DataTable
  - Redux slice with all actions
  - Basic navigation

---

## 🚀 Implementation Tasks

### INVENTORY MODULE

#### 1. Fix Inventory Index Page Issues
**File**: `resources/js/pages/admin/inventory/index.tsx`
**Problems**:
- Missing `handleFilterChange` function
- No visual view modes (currently only table)
- Edit/Delete buttons are text links instead of icon buttons
- No row click to open drawer

**Actions**:
1. Add `handleFilterChange` function
2. Add view mode state (list/grid/kanban)
3. Replace Edit/Delete text with icon buttons
4. Add `onRowClick` to open detail drawer
5. Add client-side filtering
6. Update InventoryModal to show success notifications

#### 2. Create InventoryDetailDrawer
**File**: `resources/js/components/drawers/InventoryDetailDrawer.tsx`
**Features**:
- 75% viewport width
- **Tabs**:
  - **Details Tab**: SKU, name, type, description, current stock, reorder point, average cost
  - **Stock History Tab**: Table of all inventory transactions with filters
  - **BOM Usage Tab**: List of production jobs using this material
- **Actions**:
  - Edit button (opens InventoryModal)
  - Adjust Stock button (opens StockAdjustmentModal)
  - Delete button with confirmation
- **Visual Indicators**:
  - Stock status badge (Out of Stock / Low Stock / In Stock)
  - Reorder alert banner if stock <= reorder_point
- **API Call**: `GET /admin/inventory/{id}` (needs stock_transactions relationship)

#### 3. Create StockAdjustmentModal
**File**: `resources/js/components/modals/StockAdjustmentModal.tsx`
**Fields**:
- Adjustment Type: Radio buttons (Add Stock / Remove Stock)
- Quantity: Number input
- Reason: Dropdown (MANUAL_ADJUSTMENT, DAMAGE, RETURN)
- Notes: Textarea
**Submit**: `POST /admin/inventory/{id}/adjust`
**On Success**: Show notification, refresh inventory item, close modal

#### 4. Update Inventory Index with Grid View
**Features**:
- View toggle buttons (List / Grid)
- **Grid View**: Cards showing:
  - Item image placeholder/icon
  - SKU and name
  - Stock level with badge
  - Average cost
  - Edit icon button (top-right corner)
  - Click card to open drawer
- **List View**: Current DataTable with icon buttons

---

### PURCHASES MODULE

#### 5. Create PurchaseDetailDrawer
**File**: `resources/js/components/drawers/PurchaseDetailDrawer.tsx`
**Features**:
- 75% viewport width
- **Tabs**:
  - **Details Tab**:
    - PO reference, state badge, supplier info
    - Expected delivery date
    - Total amount
    - Notes
    - Created by, created date
  - **Lines Tab**:
    - Table of purchase lines:
      - Inventory item
      - Description
      - Qty Ordered
      - Qty Received (with progress bar)
      - Unit Cost
      - Line Total
    - Total amount summary
  - **Receiving History Tab**:
    - Table of stock lots received
    - Lot number, qty, date, received by
- **Actions** (in header):
  - Edit button (opens EditPurchaseModal)
  - Send to Supplier button (if DRAFT)
  - Receive Goods button (if SENT/PARTIALLY_RECEIVED)
  - Close PO button (if FULLY_RECEIVED)
  - Delete button (if DRAFT)
**API Call**: `GET /admin/purchases/{id}`

#### 6. Create CreatePurchaseModal
**File**: `resources/js/components/modals/CreatePurchaseModal.tsx`
**Multi-step wizard**:
- **Step 1: Supplier Selection**
  - Dropdown/searchable select of suppliers
  - Link to create new supplier inline
- **Step 2: Add Lines**
  - Dynamic form array
  - For each line:
    - Inventory item dropdown
    - Quantity ordered
    - Unit cost
    - Auto-calculate line total
  - Add/Remove line buttons
  - Show running total
- **Step 3: Details**
  - Expected delivery date
  - Notes
- **Submit**: `POST /admin/purchases`
- **On Success**: Notification, redirect or open drawer

#### 7. Create EditPurchaseModal
**File**: `resources/js/components/modals/EditPurchaseModal.tsx`
**Fields** (simplified - only editable fields):
- Expected delivery date
- Notes
- Lines (can add/edit/remove if DRAFT)
**Submit**: `PUT /admin/purchases/{id}`
**On Success**: Notification, refresh PO

#### 8. Create ReceiveGoodsModal
**File**: `resources/js/components/modals/ReceiveGoodsModal.tsx`
**Features**:
- Show list of PO lines with pending quantities
- For each line checkbox to select
- Input fields for:
  - Quantity received (max = qty ordered - qty received)
  - Lot number (optional)
  - Received date (default today)
- Submit button
**Submit**: `POST /admin/purchases/{id}/receive` (with array of receipts)
**On Success**: Notification, refresh PO, update state if fully received

#### 9. Update Purchases Index
**Features**:
- Replace "View Details" text link with icon button
- Add edit icon button
- Add `onRowClick` to open PurchaseDetailDrawer
- Add state filter dropdown
- Add supplier filter dropdown
- Add search input
- Handle filter changes

---

### BACKEND UPDATES

#### 10. Update InventoryController
**File**: `app/Http/Controllers/Admin/InventoryController.php`
**Changes**:
- `store()`: Return Inertia redirect with success notification
- `update()`: Return Inertia redirect with success notification
- `destroy()`: Return Inertia redirect with success notification
- `adjustStock()`: Return Inertia redirect with success notification
- `show()`: Add stock_transactions relationship

#### 11. Update PurchaseController
**File**: `app/Http/Controllers/Admin/PurchaseController.php`
**Changes**:
- `store()`: Return Inertia redirect with success notification
- `update()`: Return Inertia redirect with success notification
- `destroy()`: Return Inertia redirect with success notification
- `send()`: Return Inertia redirect with success notification
- `receiveGoods()`: Return Inertia redirect with success notification
- `close()`: Return Inertia redirect with success notification
- `show()`: Add lines.inventoryItem, stockLots relationships

---

## UI/UX Specifications

### Common Patterns (Match Production Module)
1. **Icon Buttons**: Circle icon buttons for edit actions
2. **View Modes**: Toggle between List/Grid views
3. **Drawers**: 75% width, tabs for organized content
4. **Modals**: Centered, max-width 600px, form validation
5. **Notifications**: Top-right corner, 5 second duration
6. **Empty States**: Large icon, descriptive text, action button
7. **Badges**: Color-coded status indicators
8. **Loading States**: Skeleton loaders and spinners
9. **Confirmation Dialogs**: For destructive actions

### Color Schemes
- **Inventory Stock Status**:
  - Out of Stock: Red
  - Low Stock: Yellow/Orange
  - In Stock: Green
  
- **Purchase States**:
  - DRAFT: Gray
  - SENT: Blue
  - PARTIALLY_RECEIVED: Orange
  - FULLY_RECEIVED: Purple
  - CLOSED: Green

---

## Implementation Order

### Phase 1: Fix Existing Issues (Priority: HIGH)
1. Fix `handleFilterChange` in Inventory index ✅
2. Update InventoryModal with notifications ✅
3. Add icon buttons to Inventory table ✅

### Phase 2: Inventory Detail View (Priority: HIGH)
4. Create InventoryDetailDrawer ✅
5. Create StockAdjustmentModal ✅
6. Update Inventory index to open drawer on row click ✅

### Phase 3: Inventory Grid View (Priority: MEDIUM)
7. Add Grid view to Inventory index ✅

### Phase 4: Purchase Detail View (Priority: HIGH)
8. Create PurchaseDetailDrawer ✅
9. Create ReceiveGoodsModal ✅
10. Update Purchases index to open drawer ✅

### Phase 5: Purchase Creation (Priority: HIGH)
11. Create CreatePurchaseModal ✅
12. Create EditPurchaseModal ✅

### Phase 6: Backend Polish (Priority: MEDIUM)
13. Update all controllers to use Inertia redirects ✅
14. Add relationships to show() methods ✅

### Phase 7: Testing & Polish (Priority: LOW)
15. Test all CRUD operations ✅
16. Test state transitions ✅
17. Test notifications ✅
18. Add loading states ✅
19. Add error handling ✅

---

## Files to Create

### New Components
```
resources/js/components/
├── drawers/
│   ├── InventoryDetailDrawer.tsx       [NEW]
│   └── PurchaseDetailDrawer.tsx        [NEW]
└── modals/
    ├── StockAdjustmentModal.tsx        [NEW]
    ├── CreatePurchaseModal.tsx         [NEW]
    ├── EditPurchaseModal.tsx           [NEW]
    └── ReceiveGoodsModal.tsx           [NEW]
```

### Files to Modify
```
resources/js/pages/admin/
├── inventory/
│   └── index.tsx                       [MODIFY - add views, fix bugs]
├── purchases/
│   └── index.tsx                       [MODIFY - add drawers, filters]
└── components/modals/
    └── InventoryModal.tsx              [MODIFY - add notifications]

app/Http/Controllers/Admin/
├── InventoryController.php             [MODIFY - Inertia responses]
└── PurchaseController.php              [MODIFY - Inertia responses]
```

---

## Estimated Effort
- **Phase 1**: 30 minutes
- **Phase 2**: 2 hours  
- **Phase 3**: 1 hour
- **Phase 4**: 2 hours
- **Phase 5**: 2 hours
- **Phase 6**: 1 hour
- **Phase 7**: 1 hour

**Total**: ~9-10 hours of development time

---

## Dependencies Check
- ✅ Tabs component (created for Production)
- ✅ Textarea component (created for Production)
- ✅ Avatar component (exists)
- ✅ Badge variants (exists)
- ✅ Dialog/Sheet components (exists)
- ✅ DataTable component (exists)
- ✅ Notification system (exists)

---

## Next Steps
1. Start with Phase 1 to fix immediate bugs
2. Then proceed sequentially through phases
3. Test each phase before moving to next
4. Keep user informed of progress

Would you like me to start implementing these features now?

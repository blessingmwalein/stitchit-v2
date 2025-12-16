# 🎨 Stitchit ERP v2 - Complete Frontend UI TODO

## 📊 Current Status Analysis

### ✅ Completed Infrastructure
- **Backend**: 24 database tables, 44 API endpoints, 5 controllers, 5 services, 5 repositories
- **State Management**: Redux store with 6 slices (clients, orders, inventory, production, purchases, ui)
- **UI Components**: Badge, DataTable, Pagination, Notification, EmptyState, StatCard, Dialog, Sheet (Drawer)
- **Admin Pages**: 5 index pages created (Clients, Orders, Inventory, Production, Purchases)
- **Layouts**: AppLayout with sidebar navigation
- **Authentication**: Laravel Fortify with roles/permissions

### 🚧 Missing Frontend Components
- **Create Forms**: No create modals for any module
- **Edit Forms**: No edit modals for any module
- **Detail Views**: No detail drawers/sheets for viewing records
- **Workflow Actions**: No UI for state transitions (order approval, production start, etc.)
- **Payment Forms**: No payment recording UI
- **Material Allocation**: No BOM allocation interface
- **Stock Adjustment**: No inventory adjustment UI
- **File Upload**: No media upload interface

---

## 📋 COMPREHENSIVE TODO LIST

### **PHASE 1: Core CRUD Operations (Modals & Drawers)**

#### 1.1 Clients Module 🧑‍🤝‍🧑
- [ ] **Create Client Modal**
  - Form fields: first_name, last_name, phone (required), email, address, notes
  - Validation with error messages
  - Submit to `POST /admin/clients`
  - Show success notification & close modal

- [ ] **Edit Client Modal**
  - Pre-populate form with existing data
  - Submit to `PUT /admin/clients/{id}`
  - Update Redux store after success

- [ ] **Client Detail Drawer (Side Sheet)**
  - Display: Full client info, stats (orders count, total spent)
  - Show orders history table
  - Quick actions: Edit, Delete, Create Order
  - Use Sheet component (slides from right)

#### 1.2 Orders Module 📦
- [ ] **Create Order Modal (Complex)**
  - Step 1: Select/Create Client (search dropdown)
  - Step 2: Add Order Items (dynamic line items)
    - Description, width_cm, height_cm, quantity, unit_price
    - Auto-calculate: area_sqm, total_price
  - Step 3: Summary & Submit
  - Auto-generate reference: ORD-YYYYMMDD-XXXX
  - Submit to `POST /admin/orders`

- [ ] **Edit Order Modal**
  - Pre-populate client & items
  - Allow adding/removing items
  - Submit to `PUT /admin/orders/{id}`

- [ ] **Order Detail Drawer (Large)**
  - Display: Order header (ref, client, dates, totals)
  - Order items table
  - Payment history section
  - State timeline/progress tracker
  - Actions: Record Payment, Transition State, Convert to Production

- [ ] **Record Payment Modal**
  - Fields: amount, payment_date, payment_method, reference, notes
  - Validate: amount <= balance_due
  - Submit to `POST /admin/orders/{id}/payment`

- [ ] **Transition State Modal**
  - Show current state & available transitions
  - Confirmation message
  - Submit to `POST /admin/orders/{id}/transition`

#### 1.3 Inventory Module 📦
- [ ] **Create Inventory Item Modal**
  - Fields: sku, name, description, material_type, unit, reorder_point
  - material_type dropdown: YARN, FABRIC, BACKING, ADHESIVE, PACKAGING, OTHER
  - Submit to `POST /admin/inventory`

- [ ] **Edit Inventory Modal**
  - Pre-populate all fields
  - Submit to `PUT /admin/inventory/{id}`

- [ ] **Inventory Detail Drawer**
  - Display: Item details, current stock, average cost
  - Stock movements history table
  - Low stock warning banner
  - Actions: Adjust Stock, Edit, Delete

- [ ] **Stock Adjustment Modal**
  - Fields: adjustment_type (ADD/REMOVE), quantity, reason, notes
  - Submit to `POST /admin/inventory/{id}/adjust`

#### 1.4 Production Module 🔨
- [ ] **Production Job Detail Drawer (Large)**
  - Display: Job header (ref, order details, dates)
  - BOM requirements table
  - Material consumption log
  - Staff assignment info
  - Cost tracking (estimated vs actual)
  - Actions: Allocate Materials, Record Consumption, Transition State

- [ ] **Allocate Materials Modal**
  - Show required materials from BOM
  - For each material: show available stock, allocate quantity
  - FIFO lot selection
  - Submit to `POST /admin/production/{id}/allocate`

- [ ] **Record Consumption Modal**
  - List allocated materials
  - Enter actual quantity consumed
  - Reason for variance (if any)
  - Submit to `POST /admin/production/{id}/consume`

- [ ] **Assign Staff Modal**
  - User dropdown (production role)
  - Planned start/end dates
  - Submit to `POST /admin/production/{id}/assign`

#### 1.5 Purchases Module 🛒
- [ ] **Create Purchase Order Modal**
  - Step 1: Select/Create Supplier
  - Step 2: Add PO Lines (inventory items, quantities, unit costs)
  - Step 3: Expected delivery date, notes
  - Auto-generate PO reference
  - Submit to `POST /admin/purchases`

- [ ] **Edit Purchase Order Modal**
  - Pre-populate supplier & lines
  - Submit to `PUT /admin/purchases/{id}`

- [ ] **Purchase Order Detail Drawer**
  - Display: PO header, supplier info, lines
  - State progress tracker
  - Receiving history
  - Actions: Send to Supplier, Receive Goods, Close

- [ ] **Receive Goods Modal**
  - List PO lines
  - For each: enter received quantity, lot number, expiry date
  - Create stock lots
  - Recalculate average costs
  - Submit to `POST /admin/purchases/{id}/receive`

---

### **PHASE 2: Enhanced Features & Workflows**

#### 2.1 Media Library 📁
- [ ] **Media Upload Component**
  - Drag & drop zone
  - File type validation (images only)
  - Size limit: 10MB
  - Progress bar
  - Submit to `POST /admin/media/upload`

- [ ] **Media Gallery Modal**
  - Grid view of uploaded files
  - Preview on click
  - Delete action
  - Use for order design images & finished rug photos

#### 2.2 Dashboard Enhancements 📊
- [ ] **Real-time Stats**
  - Fetch actual counts from API
  - Update client count, active orders, production jobs, low stock
  - Add charts: Sales trend, order states distribution

- [ ] **Recent Activity Feed**
  - Last 10 orders created
  - Production jobs completed
  - Low stock alerts

#### 2.3 Search & Filters 🔍
- [ ] **Advanced Search**
  - Clients: phone, name, email
  - Orders: reference, client name, date range
  - Inventory: SKU, name, material type
  - Production: job reference, order reference

- [ ] **Filter Persistence**
  - Save filters in Redux
  - Apply on page load

#### 2.4 Notifications System 🔔
- [ ] **Toast Notifications**
  - Already have Notification component
  - Hook up to all CRUD operations
  - Success/Error/Info variants

- [ ] **Error Boundary**
  - Catch React errors
  - Display user-friendly message
  - Log to console

---

### **PHASE 3: Complete Workflow Integration**

#### 3.1 Client → Order → Production → Delivery Flow
1. **Client Management**
   - Create client via modal
   - View client details in drawer
   - See order history

2. **Order Creation**
   - Search/select client
   - Add rug specifications (dimensions, design)
   - Upload design images (media library)
   - Calculate pricing
   - Record deposit payment

3. **Order Approval**
   - Transition: pending → deposit_paid → approved
   - Convert approved order to production job

4. **Production**
   - Auto-create production job from order
   - Allocate materials (BOM with FIFO)
   - Start production (record start date)
   - Track material consumption
   - Quality check
   - Mark completed

5. **Completion & Delivery**
   - Upload finished rug photos
   - Mark order as ready
   - Record final payment
   - Mark delivered

#### 3.2 Inventory → Purchase Flow
1. **Low Stock Detection**
   - Dashboard shows low stock items
   - "Needs Reorder" page lists items below reorder point

2. **Purchase Order Creation**
   - Select supplier
   - Add low stock items
   - Send to supplier

3. **Goods Receiving**
   - Receive partial/full quantities
   - Create stock lots with tracking
   - Update inventory levels
   - Recalculate average costs

---

### **PHASE 4: UI/UX Polish**

#### 4.1 Design System Consistency
- [ ] All modals use consistent styling
- [ ] All drawers slide from right
- [ ] Consistent button colors (primary: #FF8A50)
- [ ] Loading states on all forms
- [ ] Disabled states during submission

#### 4.2 Responsive Design
- [ ] Mobile-friendly modals (full screen on small devices)
- [ ] Responsive data tables
- [ ] Touch-friendly buttons

#### 4.3 Accessibility
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] ARIA labels on all interactive elements
- [ ] Focus management in modals
- [ ] Screen reader support

#### 4.4 Performance
- [ ] Lazy load heavy components
- [ ] Virtualize long lists
- [ ] Debounce search inputs
- [ ] Cache API responses

---

## 🛠️ Technical Implementation Guide

### Modal Component Pattern
```tsx
// Use Dialog component from shadcn/ui
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateClientModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState({...});
  
  const handleSubmit = async () => {
    // Validation
    // API call via Redux thunk
    // Show notification
    // Close modal
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
        </DialogHeader>
        {/* Form fields */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Client</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Drawer/Sheet Component Pattern
```tsx
// Use Sheet component for side drawers
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function ClientDetailDrawer({ clientId, open, onClose }: Props) {
  const client = useAppSelector(state => 
    state.clients.items.find(c => c.id === clientId)
  );
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle>{client?.display_name}</SheetTitle>
        </SheetHeader>
        {/* Client details */}
        {/* Orders history */}
        {/* Action buttons */}
      </SheetContent>
    </Sheet>
  );
}
```

### Redux Thunk Pattern for CRUD
```tsx
// Already have this pattern in slices
export const createClient = createAsyncThunk(
  'clients/create',
  async (data: ClientFormData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/admin/clients', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

---

## 📅 Recommended Implementation Order

### Week 1: Core CRUD (Foundation)
1. Clients: Create, Edit, Detail Drawer
2. Orders: Create (basic), Detail Drawer
3. Inventory: Create, Edit, Detail Drawer

### Week 2: Production & Purchases
4. Production: Detail Drawer, Allocate Materials
5. Purchases: Create, Edit, Receive Goods

### Week 3: Workflows & Actions
6. Order: Record Payment, State Transitions
7. Production: Record Consumption, Assign Staff
8. Inventory: Stock Adjustments

### Week 4: Polish & Integration
9. Media Library Upload
10. Dashboard Real-time Stats
11. Search & Filters
12. Error Handling & Validation

---

## 🎯 Priority Matrix

### HIGH PRIORITY (Must Have)
- ✅ Client Create/Edit Modals
- ✅ Order Create Modal (simplified)
- ✅ Order Detail Drawer with Payment
- ✅ Production Detail Drawer
- ✅ Inventory Stock Adjustment

### MEDIUM PRIORITY (Should Have)
- Order Edit Modal
- Purchase Create/Edit Modals
- Material Allocation UI
- Media Upload Component
- Dashboard Stats

### LOW PRIORITY (Nice to Have)
- Advanced Search
- Charts & Analytics
- Mobile Responsive Refinements
- Keyboard Shortcuts

---

## 📝 Notes

### Existing Components to Use
- `Dialog` from `@/components/ui/dialog` for modals
- `Sheet` from `@/components/ui/sheet` for side drawers
- `Button`, `Input`, `Select` for form controls
- `DataTable` for lists within drawers
- `Badge` for status indicators
- `EmptyState` for no data states
- `Notification` for toast messages

### API Integration
- All API routes already exist in `routes/web.php`
- Controllers return JSON for API calls
- Use Inertia for page navigation
- Use Axios for AJAX calls in modals

### State Management
- Redux slices already created for all modules
- Add new thunks for missing CRUD operations
- Update reducers to handle new actions

---

## ✅ Completion Checklist

Track your progress as you implement each feature:

- [ ] **Clients Module Complete** (3 components)
- [ ] **Orders Module Complete** (5 components)
- [ ] **Inventory Module Complete** (4 components)
- [ ] **Production Module Complete** (4 components)
- [ ] **Purchases Module Complete** (4 components)
- [ ] **Media Library Complete** (2 components)
- [ ] **Dashboard Enhanced** (2 features)
- [ ] **All Workflows Tested** (End-to-end)

---

**Total Components to Build: ~30**
**Estimated Time: 3-4 weeks**
**Status: Ready to Start! 🚀**

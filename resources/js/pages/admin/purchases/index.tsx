import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPurchases } from '@/store/slices/purchasesSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseStateBadge } from '@/components/ui/badge';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { PurchaseOrder } from '@/store/slices/purchasesSlice';
import { PurchaseDetailDrawer } from '@/components/drawers/PurchaseDetailDrawer';
import { CreatePurchaseModal } from '@/components/modals/CreatePurchaseModal';
import { EditPurchaseModal } from '@/components/modals/EditPurchaseModal';
import { Edit } from 'lucide-react';
import axios from 'axios';

export default function PurchasesIndex() {
  const dispatch = useAppDispatch();
  const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state: any) => state.purchases);
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [selectedPOId, setSelectedPOId] = React.useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedPO, setSelectedPO] = React.useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = React.useState([]);
  const [inventoryItems, setInventoryItems] = React.useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>();
  const [dateTo, setDateTo] = React.useState<Date | undefined>();
  const [sortField, setSortField] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    dispatch(fetchPurchases({}));
    fetchSuppliersAndInventory();
  }, [dispatch]);

  // Debounced filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: any = { page: 1 };
      if (searchQuery) filters.search = searchQuery;
      if (supplierFilter) filters.supplier_id = supplierFilter;
      if (stateFilter) filters.state = stateFilter;
      if (dateFrom) filters.date_from = format(dateFrom, 'yyyy-MM-dd');
      if (dateTo) filters.date_to = format(dateTo, 'yyyy-MM-dd');
      dispatch(fetchPurchases(filters));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, supplierFilter, stateFilter, dateFrom, dateTo, dispatch]);

  const fetchSuppliersAndInventory = async () => {
    try {
      const [suppliersRes, inventoryRes] = await Promise.all([
        axios.get('/admin/suppliers', { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          params: { per_page: 1000 } // Get all suppliers without pagination
        }),
        axios.get('/admin/inventory', { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          params: { per_page: 1000 } // Get all inventory items
        }),
      ]);
      
      // Laravel pagination response structure: { data: [...], current_page, last_page, etc }
      const suppliersList = suppliersRes.data.data || [];
      const inventoryList = inventoryRes.data.data || [];
      
      console.log('Fetched suppliers:', suppliersList.length, suppliersList);
      console.log('Fetched inventory:', inventoryList.length, inventoryList);
      
      setSuppliers(suppliersList);
      setInventoryItems(inventoryList);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handlePageChange = (page: number) => {
    const params: any = { page };
    if (sortField) {
      params.sort_by = sortField;
      params.sort_direction = sortDirection;
    }
    dispatch(fetchPurchases(params));
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    dispatch(fetchPurchases({ 
      sort_by: field, 
      sort_direction: newDirection 
    }));
  };

  const handleRowClick = (po: PurchaseOrder) => {
    setSelectedPOId(po.id);
    setShowDrawer(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowEditModal(true);
  };

  const handleReceive = (po: PurchaseOrder) => {
    // TODO: Open receive goods modal
    console.log('Receive goods for PO:', po);
  };

  const handleSend = async (po: PurchaseOrder) => {
    try {
      await axios.post(`/admin/purchases/${po.id}/send`);
      
      dispatch(showNotification({
        type: 'success',
        message: 'Purchase marked as bought and inventory updated!',
        duration: 5000,
      }));

      dispatch(fetchPurchases({}));
      setShowDrawer(false);
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to process purchase',
        duration: 5000,
      }));
    }
  };

  const handleDeleted = () => {
    dispatch(fetchPurchases({}));
  };

  const handleCreateSuccess = () => {
    dispatch(fetchPurchases({}));
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    dispatch(fetchPurchases({}));
    setShowEditModal(false);
    setSelectedPO(null);
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      header: 'PO #',
      accessor: 'reference',
      className: 'font-mono font-medium',
      sortable: true,
      sortKey: 'reference',
    },
    {
      header: 'Supplier',
      accessor: (row) => row.supplier?.name || '-',
    },
    {
      header: 'State',
      accessor: (row) => <PurchaseStateBadge state={row.state} />,
      sortable: true,
      sortKey: 'state',
    },
    {
      header: 'Expected Delivery',
      accessor: (row) =>
        row.expected_date
          ? formatDate(row.expected_date)
          : '-',
      className: 'text-sm',
      sortable: true,
      sortKey: 'expected_date',
    },
    {
      header: 'Lines',
      accessor: (row) => row.lines?.length || 0,
      className: 'text-center',
    },
    {
      header: 'Created',
      accessor: (row) => formatDate(row.created_at),
      className: 'text-muted-foreground text-sm',
      sortable: true,
      sortKey: 'created_at',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          className="h-8 w-8 rounded-full"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      className: 'text-center',
    },
  ];

  return (
    <AppLayout>
      <Head title="Purchase Orders" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Purchase Orders</h2>
              <p className="text-muted-foreground mt-1">
                Manage procurement and supplier orders
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/suppliers">
                <Button variant="outline">
                  Manage Suppliers
                </Button>
              </Link>
              <Button onClick={() => setShowCreateModal(true)}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Purchase Order
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Search by PO# or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <Select
                value={supplierFilter}
                onValueChange={(value) => setSupplierFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stateFilter}
                onValueChange={(value) => setStateFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                  <SelectItem value="FULLY_RECEIVED">Fully Received</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder="From Date"
                className="w-[160px]"
              />
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
                placeholder="To Date"
                className="w-[160px]"
              />
              {(searchQuery || supplierFilter || stateFilter || dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSupplierFilter('');
                    setStateFilter('');
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    dispatch(fetchPurchases({ page: 1 }));
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {items.length === 0 && !loading ? (
            <EmptyState
              icon={EmptyIcons.Inbox}
              title="No purchase orders yet"
              description="Create purchase orders to restock inventory from suppliers."
              action={{
                label: 'Create First PO',
                onClick: () => setShowCreateModal(true),
              }}
            />
          ) : (
            <>
              <DataTable
                data={items}
                columns={columns}
                loading={loading}
                onRowClick={handleRowClick}
                sortable={true}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />

              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                perPage={pagination.per_page}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Purchase Detail Drawer */}
      <PurchaseDetailDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        poId={selectedPOId}
        onEdit={handleEdit}
        onReceive={handleReceive}
        onSend={handleSend}
        onDeleted={handleDeleted}
      />

      {/* Create Purchase Modal */}
      <CreatePurchaseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Purchase Modal */}
      <EditPurchaseModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPO(null);
        }}
        purchaseOrder={selectedPO}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        onSuccess={handleEditSuccess}
      />
    </AppLayout>
  );
}

import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInventory, deleteInventoryItem } from '@/store/slices/inventorySlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { InventoryItem } from '@/store/slices/inventorySlice';
import { InventoryModal } from '@/components/modals/InventoryModal';
import { InventoryDetailDrawer } from '@/components/drawers/InventoryDetailDrawer';
import { StockAdjustmentModal } from '@/components/modals/StockAdjustmentModal';
import { Edit } from 'lucide-react';

export default function InventoryIndex() {
  const dispatch = useAppDispatch();
  const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state: any) => state.inventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    dispatch(fetchInventory({}));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    const params: any = { page };
    if (sortField) {
      params.sort_by = sortField;
      params.sort_direction = sortDirection;
    }
    dispatch(fetchInventory(params));
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    dispatch(fetchInventory({ 
      sort_by: field, 
      sort_direction: newDirection 
    }));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await dispatch(deleteInventoryItem(id)).unwrap();
        dispatch(showNotification({
          type: 'success',
          message: 'Inventory item deleted successfully',
        }));
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to delete inventory item',
        }));
      }
    }
  };

  const handleModalSuccess = () => {
    dispatch(fetchInventory({}));
    setSelectedItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleFilterChange = (filters: { search?: string; type?: string }) => {
    const newFilters = {
      search: filters.search !== undefined ? filters.search : searchQuery,
      type: filters.type,
    };
    dispatch(fetchInventory(newFilters));
  };

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    setShowDrawer(true);
  };

  const handleEditFromDrawer = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAdjustFromDrawer = (item: InventoryItem) => {
    setAdjustingItem(item);
    setShowAdjustModal(true);
  };

  const handleDrawerDeleted = () => {
    dispatch(fetchInventory({}));
  };

  const handleAdjustmentSuccess = () => {
    dispatch(fetchInventory({}));
    if (selectedItemId) {
      // Refresh drawer if open
      setShowDrawer(false);
      setTimeout(() => setShowDrawer(true), 100);
    }
  };

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.current_stock <= 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    }
    if (item.current_stock <= item.reorder_point) {
      return <Badge variant="default" className="bg-yellow-500 text-white text-xs">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600 text-white text-xs">In Stock</Badge>;
  };

  const columns: Column<InventoryItem>[] = [
    {
      header: 'SKU',
      accessor: 'sku',
      className: 'font-mono font-medium',
      sortable: true,
      sortKey: 'sku',
    },
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Type',
      accessor: (row) => row.type.replace('_', ' ').toUpperCase(),
      className: 'text-sm',
    },
    {
      header: 'Stock',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.current_stock} {row.unit}</span>
          {getStockStatusBadge(row)}
        </div>
      ),
      sortable: true,
      sortKey: 'current_stock',
    },
    {
      header: 'Avg Cost',
      accessor: (row) => {
        const cost = row.average_cost || row.unit_cost || 0;
        return `$${Number(cost).toFixed(8)}`;
      },
      className: 'text-right',
      sortable: true,
      sortKey: 'average_cost',
    },
    {
      header: 'Reorder Point',
      accessor: (row) => `${row.reorder_point} ${row.unit}`,
      className: 'text-right text-muted-foreground',
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
          className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      className: 'text-center',
    },
  ];

  return (
    <AppLayout>
      <Head title="Inventory" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Inventory</h2>
              <p className="text-muted-foreground mt-1">
                Manage materials and supplies
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/inventory/needs-reorder">
                <Button variant="outline" className="rounded-full">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Reorder Alerts
                </Button>
              </Link>
              <Button onClick={() => {
                setSelectedItem(null);
                setShowModal(true);
              }} className="rounded-full">
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
                New Item
              </Button>
            </div>
          </div>

          {/* Filters Card */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Search by SKU or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange({ search: e.target.value });
                }}
                className="max-w-md"
              />
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  handleFilterChange({ type: value || undefined });
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="yarn">Yarn</SelectItem>
                  <SelectItem value="tufting_cloth">Tufting Cloth</SelectItem>
                  <SelectItem value="backing_cloth">Backing Cloth</SelectItem>
                  <SelectItem value="carpet_tile_vinyl">Carpet Tile Vinyl</SelectItem>
                  <SelectItem value="backing_glue">Backing Glue</SelectItem>
                  <SelectItem value="glue_stick">Glue Stick</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || typeFilter) && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('');
                    handleFilterChange({ search: '', type: undefined });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            {items.length === 0 && !loading ? (
              <EmptyState
                icon={EmptyIcons.Box}
                title="No inventory items yet"
                description="Add materials and supplies to track your inventory."
                action={{
                  label: 'Add First Item',
                  onClick: () => {
                    setSelectedItem(null);
                    setShowModal(true);
                  },
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
      </div>

      {/* Inventory Modal */}
      <InventoryModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        inventoryItem={selectedItem ? {
          ...selectedItem,
          description: selectedItem.description ?? undefined
        } : null}
        onSuccess={handleModalSuccess}
      />

      {/* Inventory Detail Drawer */}
      <InventoryDetailDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        itemId={selectedItemId}
        onEdit={handleEditFromDrawer}
        onAdjust={handleAdjustFromDrawer}
        onDeleted={handleDrawerDeleted}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        item={adjustingItem}
        onSuccess={handleAdjustmentSuccess}
      />
    </AppLayout>
  );
}

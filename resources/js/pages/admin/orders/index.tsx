import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders, deleteOrder } from '@/store/slices/ordersSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { OrderStateBadge } from '@/components/ui/badge';
import { Order } from '@/store/slices/ordersSlice';
import { OrderModal } from '@/components/modals/OrderModal';
import { OrderDetailDrawer } from '@/components/drawers/OrderDetailDrawer';
import { ClientAvatarCard } from '@/components/ui/client-avatar-card';
import { formatDate } from '@/lib/utils';
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';

export default function OrdersIndex() {
  const dispatch = useAppDispatch();
  const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state) => state.orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [referenceFilter, setReferenceFilter] = useState('');
  const [clientNameFilter, setClientNameFilter] = useState('');
  const [clientEmailFilter, setClientEmailFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: any = { page: 1 };
      if (searchQuery) filters.search = searchQuery;
      if (stateFilter) filters.state = stateFilter;
      if (referenceFilter) filters.reference = referenceFilter;
      if (clientNameFilter) filters.client_name = clientNameFilter;
      if (clientEmailFilter) filters.client_email = clientEmailFilter;
      dispatch(fetchOrders(filters));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, stateFilter, referenceFilter, clientNameFilter, clientEmailFilter, dispatch]);

  const handlePageChange = (page: number) => {
    const params: any = { page };
    if (sortField) {
      params.sort_by = sortField;
      params.sort_direction = sortDirection;
    }
    dispatch(fetchOrders(params));
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    dispatch(fetchOrders({ 
      sort_by: field, 
      sort_direction: newDirection 
    }));
  };

  const handleCreateSuccess = () => {
    dispatch(fetchOrders({}));
  };

  const handleOrderUpdated = () => {
    dispatch(fetchOrders({}));
  };

  const handleRowClick = (order: Order) => {
    setShowDetailDrawer(false); // Close first to reset state
    setTimeout(() => {
      setSelectedOrderId(order.id);
      setShowDetailDrawer(true);
    }, 0);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await dispatch(deleteOrder(id)).unwrap();
        dispatch(showNotification({
          type: 'success',
          message: 'Order deleted successfully',
        }));
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to delete order',
        }));
      }
    }
  };

  const columns: Column<Order>[] = [
    {
      header: 'Reference',
      accessor: 'reference',
      className: 'font-mono font-medium',
      sortable: true,
      sortKey: 'reference',
    },
    {
      header: 'Client',
      accessor: (row) => row.client ? (
        <ClientAvatarCard client={row.client} />
      ) : '-',
    },
    {
      header: 'Items',
      accessor: (row) => row.items_count || 0,
      className: 'text-center',
    },
    {
      header: 'State',
      accessor: (row) => <OrderStateBadge state={row.state} />,
      sortable: true,
      sortKey: 'state',
    },
    {
      header: 'Total',
      accessor: (row) => `$${Number(row.total_amount || 0).toFixed(2)}`,
      className: 'text-right',
      sortable: true,
      sortKey: 'total_amount',
    },
    {
      header: 'Paid',
      accessor: (row) => {
        const paidAmount = row.payments?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0;
        return `$${paidAmount.toFixed(2)}`;
      },
      className: 'text-right',
    },
    {
      header: 'Balance',
      accessor: (row) => {
        const balance = Number(row.balance_due || 0);
        return (
          <span className={balance > 0 ? 'text-yellow-600 font-medium' : ''}>
            ${balance.toFixed(2)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      header: 'Date',
      accessor: (row) => formatDate(row.created_at),
      className: 'text-muted-foreground',
      sortable: true,
      sortKey: 'created_at',
    },
    {
      header: 'Actions',
      accessor: (row) => {
        const canEdit = !['IN_PRODUCTION', 'READY_FOR_DISPATCH', 'DISPATCHED', 'CLOSED', 'ARCHIVED'].includes(row.state);
        
        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(row);
              }}
              className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
              title="View Order"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (canEdit) {
                  setSelectedOrderForEdit(row);
                  setShowEditModal(true);
                }
              }}
              disabled={!canEdit}
              className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={canEdit ? 'Edit Order' : 'Cannot edit orders in production or later'}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Order"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      className: 'text-right',
    },
  ];

  return (
    <AppLayout>
      <Head title="Orders" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Orders</h2>
              <p className="text-muted-foreground mt-1">
                Manage customer orders and quotes
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-full">
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
                New Order
              </Button>
          </div>

          {/* Filters Card */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Search all..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">All States</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_DEPOSIT">Pending Deposit</option>
                <option value="DEPOSIT_PAID">Deposit Paid</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <Input
                type="text"
                placeholder="Filter by reference..."
                value={referenceFilter}
                onChange={(e) => setReferenceFilter(e.target.value)}
                className="max-w-xs"
              />
              <Input
                type="text"
                placeholder="Filter by client name..."
                value={clientNameFilter}
                onChange={(e) => setClientNameFilter(e.target.value)}
                className="max-w-xs"
              />
              <Input
                type="text"
                placeholder="Filter by client email..."
                value={clientEmailFilter}
                onChange={(e) => setClientEmailFilter(e.target.value)}
                className="max-w-xs"
              />
              {(searchQuery || stateFilter || referenceFilter || clientNameFilter || clientEmailFilter) && (
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => {
                    setSearchQuery('');
                    setStateFilter('');
                    setReferenceFilter('');
                    setClientNameFilter('');
                    setClientEmailFilter('');
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
                icon={EmptyIcons.Clipboard}
                title="No orders yet"
                description="Start creating orders for your clients."
                action={{
                  label: 'Create First Order',
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
      </div>

      {/* Create Order Modal */}
      <OrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Order Modal */}
      <OrderModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrderForEdit(null);
        }}
        order={selectedOrderForEdit}
        onSuccess={() => {
          handleCreateSuccess();
          setShowEditModal(false);
          setSelectedOrderForEdit(null);
        }}
      />

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onOrderUpdated={handleOrderUpdated}
      />
    </AppLayout>
  );
}

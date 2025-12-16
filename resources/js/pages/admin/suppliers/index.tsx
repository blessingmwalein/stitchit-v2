import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { Edit } from 'lucide-react';
import { SupplierModal } from '@/components/modals/SupplierModal';
import axios from 'axios';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function SuppliersIndex() {
  const dispatch = useAppDispatch();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchSuppliers = async (page = 1, search = '', sortBy = '', sortDir: 'asc' | 'desc' = 'asc') => {
    setLoading(true);
    try {
      const params: any = { page, search, per_page: 15 };
      if (sortBy) {
        params.sort_by = sortBy;
        params.sort_direction = sortDir;
      }
      const response = await axios.get('/admin/suppliers', {
        params,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      setSuppliers(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers(1, searchQuery, sortField, sortDirection);
  };

  const handlePageChange = (page: number) => {
    fetchSuppliers(page, searchQuery, sortField, sortDirection);
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    fetchSuppliers(1, searchQuery, field, newDirection);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await axios.delete(`/admin/suppliers/${id}`);
      dispatch(
        showNotification({
          type: 'success',
          message: 'Supplier deleted successfully',
          duration: 5000,
        })
      );
      fetchSuppliers(pagination.current_page, searchQuery, sortField, sortDirection);
    } catch (error: any) {
      dispatch(
        showNotification({
          type: 'error',
          message: error.response?.data?.message || 'Failed to delete supplier',
          duration: 5000,
        })
      );
    }
  };

  const handleModalSuccess = () => {
    fetchSuppliers(pagination.current_page, searchQuery, sortField, sortDirection);
  };

  const columns: Column<Supplier>[] = [
    {
      header: 'Name',
      accessor: 'name',
      className: 'font-medium',
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Email',
      accessor: (row) => row.email || '-',
      className: 'text-muted-foreground',
      sortable: true,
      sortKey: 'email',
    },
    {
      header: 'Phone',
      accessor: (row) => row.phone || '-',
      className: 'text-muted-foreground',
    },
    {
      header: 'Address',
      accessor: (row) => {
        if (!row.address) return '-';
        return row.address.length > 50 ? row.address.substring(0, 50) + '...' : row.address;
      },
      className: 'text-sm',
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
        <div className="flex items-center gap-2">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-center',
    },
  ];

  return (
    <AppLayout>
      <Head title="Suppliers" />

      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
              <p className="text-muted-foreground mt-1">
                Manage your suppliers and vendor information
              </p>
            </div>
            <Button onClick={handleCreate}>
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
              New Supplier
            </Button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit">Search</Button>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  fetchSuppliers(1, '', sortField, sortDirection);
                }}
              >
                Clear
              </Button>
            )}
          </form>

          {/* Table */}
          {suppliers.length === 0 && !loading ? (
            <EmptyState
              icon={EmptyIcons.Inbox}
              title="No suppliers yet"
              description="Add your first supplier to start managing vendors and purchase orders."
              action={{
                label: 'Create First Supplier',
                onClick: handleCreate,
              }}
            />
          ) : (
            <>
              <DataTable 
                data={suppliers} 
                columns={columns} 
                loading={loading}
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

      {/* Supplier Modal */}
      <SupplierModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        onSuccess={handleModalSuccess}
      />
    </AppLayout>
  );
}

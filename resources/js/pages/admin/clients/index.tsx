import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClients, deleteClient } from '@/store/slices/clientsSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { Client } from '@/store/slices/clientsSlice';
import { ClientModal } from '@/components/modals/ClientModal';
import { ClientDetailDrawer } from '@/components/drawers/ClientDetailDrawer';
import { PhoneDisplay } from '@/components/ui/phone-display';
import { UserAvatar } from '@/components/ui/user-avatar';
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';

export default function ClientsIndex() {
    const dispatch = useAppDispatch();
    const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state) => state.clients);
    const [searchQuery, setSearchQuery] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);

    useEffect(() => {
        dispatch(fetchClients({}));
    }, [dispatch]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            const filters: any = { page: 1 };
            if (searchQuery) filters.search = searchQuery;
            if (phoneFilter) filters.phone = phoneFilter;
            if (emailFilter) filters.email = emailFilter;
            if (nameFilter) filters.name = nameFilter;
            dispatch(fetchClients(filters));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, phoneFilter, emailFilter, nameFilter, dispatch]);

    const handlePageChange = (page: number) => {
        const filters: any = { page };
        if (sortField) {
            filters.sort_by = sortField;
            filters.sort_direction = sortDirection;
        }
        dispatch(fetchClients(filters));
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        
        const filters: any = { page: 1 };
        if (searchQuery) filters.search = searchQuery;
        if (phoneFilter) filters.phone = phoneFilter;
        if (emailFilter) filters.email = emailFilter;
        if (nameFilter) filters.name = nameFilter;
        filters.sort_by = field;
        filters.sort_direction = newDirection;
        dispatch(fetchClients(filters));
    };

    const handleClientClick = (client: Client) => {
        setSelectedClientId(client.id);
        setShowDetailDrawer(true);
    };

    const handleCreateSuccess = () => {
        dispatch(fetchClients({}));
        setShowCreateModal(false);
        dispatch(showNotification({
            type: 'success',
            message: 'Client created successfully',
        }));
    };

    const handleEditSuccess = () => {
        dispatch(fetchClients({}));
        setShowEditModal(false);
        dispatch(showNotification({
            type: 'success',
            message: 'Client updated successfully',
        }));
    };

    const handleClientUpdated = () => {
        dispatch(fetchClients({}));
    };

    const handleClientDeleted = () => {
        dispatch(fetchClients({}));
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this client?')) {
            try {
                await dispatch(deleteClient(id)).unwrap();
                dispatch(showNotification({
                    type: 'success',
                    message: 'Client deleted successfully',
                }));
            } catch (error) {
                dispatch(showNotification({
                    type: 'error',
                    message: 'Failed to delete client',
                }));
            }
        }
    };

    const columns: Column<Client>[] = [
        {
            header: 'Client',
            sortable: true,
            sortKey: 'full_name',
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <UserAvatar name={row.full_name || row.nickname || row.phone} size="sm" />
                    <div>
                        {row.full_name && (
                            <p className="font-medium text-gray-900">{row.full_name}</p>
                        )}
                        {row.nickname && (
                            <p className={row.full_name ? "text-xs text-gray-500" : "font-medium text-gray-900"}>
                                {row.full_name ? `(${row.nickname})` : row.nickname}
                            </p>
                        )}
                        {!row.full_name && !row.nickname && (
                            <p className="font-medium text-gray-900">{row.phone}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: 'Phone',
            sortable: true,
            sortKey: 'phone',
            accessor: (row) => <PhoneDisplay phone={row.phone} />,
        },
        {
            header: 'Gender',
            accessor: (row) => row.gender ? (
                <span className="capitalize">{row.gender}</span>
            ) : '-',
            className: 'text-muted-foreground',
        },
        {
            header: 'Address',
            accessor: (row) => (
                <span className="max-w-[200px] truncate block" title={row.address || ''}>
                    {row.address || '-'}
                </span>
            ),
            className: 'text-muted-foreground',
        },
        {
            header: 'Orders',
            sortable: true,
            sortKey: 'orders_count',
            accessor: (row) => row.orders_count || 0,
            className: 'text-center',
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-1 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClientClick(row);
                        }}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(row);
                            setShowEditModal(true);
                        }}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
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
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            ),
            className: 'text-right',
        },
    ];

    return (
        <AppLayout>
            <Head title="Clients" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground">Clients</h2>
                            <p className="text-muted-foreground mt-1">
                                Manage your customer database
                            </p>
                        </div>

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
                            New Client
                        </Button>

                    </div>

                    <div className="mb-6 flex gap-4 flex-wrap">
                        <Input
                            type="text"
                            placeholder="Search all..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-xs"
                        />
                        <Input
                            type="text"
                            placeholder="Filter by phone..."
                            value={phoneFilter}
                            onChange={(e) => setPhoneFilter(e.target.value)}
                            className="max-w-xs"
                        />
                        <Input
                            type="text"
                            placeholder="Filter by name..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="max-w-xs"
                        />
                        <Input
                            type="text"
                            placeholder="Filter by email..."
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            className="max-w-xs"
                        />
                        {(searchQuery || phoneFilter || emailFilter || nameFilter) && (
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSearchQuery('');
                                    setPhoneFilter('');
                                    setEmailFilter('');
                                    setNameFilter('');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {items.length === 0 && !loading ? (
                        <EmptyState
                            icon={EmptyIcons.Users}
                            title="No clients yet"
                            description="Get started by adding your first client to the system."
                            action={{
                                label: 'Add First Client',
                                onClick: () => setShowCreateModal(true),
                            }}
                        />
                    ) : (
                        <>
                            <DataTable
                                data={items}
                                columns={columns}
                                loading={loading}
                                onRowClick={handleClientClick}
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

            {/* Create Client Modal */}
            <ClientModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Client Modal */}
            {selectedClient && (
                <ClientModal
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedClient(null);
                    }}
                    client={selectedClient}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Client Detail Drawer */}
            <ClientDetailDrawer
                clientId={selectedClientId}
                open={showDetailDrawer}
                onClose={() => setShowDetailDrawer(false)}
                onClientUpdated={handleClientUpdated}
                onClientDeleted={handleClientDeleted}
            />
        </AppLayout>
    );
}

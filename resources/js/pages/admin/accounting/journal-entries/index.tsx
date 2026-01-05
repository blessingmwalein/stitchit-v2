import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJournalEntries, voidJournalEntry, JournalEntry } from '@/store/slices/journalEntriesSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { JournalEntryDetailDrawer } from '@/components/drawers/JournalEntryDetailDrawer';
import { Plus, BookOpen, Eye, XCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function JournalEntriesIndex() {
  const dispatch = useAppDispatch();
  const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state: any) => state.journalEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    dispatch(fetchJournalEntries({}));
  }, [dispatch]);

  const handleFilterChange = (filters: { search?: string; type?: string; status?: string; date_from?: string; date_to?: string }) => {
    const params: any = {};
    if (filters.search !== undefined) params.search = filters.search;
    if (filters.type !== undefined && filters.type !== 'all') params.type = filters.type;
    if (filters.status !== undefined && filters.status !== 'all') params.status = filters.status;
    if (filters.date_from !== undefined) params.date_from = filters.date_from;
    if (filters.date_to !== undefined) params.date_to = filters.date_to;
    dispatch(fetchJournalEntries(params));
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const params: any = { sort_field: field, sort_direction: newDirection };
    if (searchQuery) params.search = searchQuery;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
    if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');

    dispatch(fetchJournalEntries(params));
  };

  const handlePageChange = (page: number) => {
    const params: any = { page };
    if (searchQuery) params.search = searchQuery;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
    if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');
    if (sortField) {
      params.sort_field = sortField;
      params.sort_direction = sortDirection;
    }
    dispatch(fetchJournalEntries(params));
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalDebits = items.reduce((sum: number, entry: JournalEntry) => {
      const entryDebits = entry.lines
        .filter(line => line.type === 'DEBIT')
        .reduce((s, l) => s + Number(l.amount), 0);
      return sum + entryDebits;
    }, 0);

    const totalCredits = items.reduce((sum: number, entry: JournalEntry) => {
      const entryCredits = entry.lines
        .filter(line => line.type === 'CREDIT')
        .reduce((s, l) => s + Number(l.amount), 0);
      return sum + entryCredits;
    }, 0);

    const postedCount = items.filter((entry: JournalEntry) => entry.status === 'POSTED').length;
    const draftCount = items.filter((entry: JournalEntry) => entry.status === 'DRAFT').length;

    return {
      totalEntries: items.length,
      totalDebits,
      totalCredits,
      postedCount,
      draftCount,
    };
  };

  const handleRowClick = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setShowDrawer(true);
  };

  const handleDrawerVoided = () => {
    dispatch(fetchJournalEntries({}));
  };

  const summary = calculateSummary();

    const getStatusBadge = (status: string) => {
        const badges = {
            DRAFT: 'bg-gray-50 text-gray-700 ring-gray-600/20',
            POSTED: 'bg-green-50 text-green-700 ring-green-600/20',
            VOID: 'bg-red-50 text-red-700 ring-red-600/20',
        };
        return badges[status as keyof typeof badges] || badges.DRAFT;
    };

    const getTypeBadge = (type: string) => {
        const badges = {
            GENERAL: 'bg-gray-50 text-gray-700 ring-gray-600/20',
            SALES: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            PURCHASE: 'bg-purple-50 text-purple-700 ring-purple-600/20',
            PAYMENT: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
            RECEIPT: 'bg-green-50 text-green-700 ring-green-600/20',
            EXPENSE: 'bg-orange-50 text-orange-700 ring-orange-600/20',
            ADJUSTMENT: 'bg-red-50 text-red-700 ring-red-600/20',
            DEPRECIATION: 'bg-pink-50 text-pink-700 ring-pink-600/20',
            INVENTORY: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        };
        return badges[type as keyof typeof badges] || badges.GENERAL;
    };

    const getTotalDebits = (entry: JournalEntry) => {
        return entry.lines
            .filter(line => line.type === 'DEBIT')
            .reduce((sum, line) => sum + parseFloat(line.amount.toString()), 0);
    };

    const getTotalCredits = (entry: JournalEntry) => {
        return entry.lines
            .filter(line => line.type === 'CREDIT')
            .reduce((sum, line) => sum + parseFloat(line.amount.toString()), 0);
    };

    const handleVoid = (entry: JournalEntry) => {
        setConfirmDialog({
            open: true,
            title: 'Void Journal Entry',
            description: `Are you sure you want to void journal entry ${entry.reference}? This will reverse all account balances.`,
            onConfirm: async () => {
                try {
                    await dispatch(voidJournalEntry(entry.id)).unwrap();
                    dispatch(showNotification({
                        type: 'success',
                        message: 'Journal entry voided successfully',
                        duration: 3000,
                    }));
                    dispatch(fetchJournalEntries({}));
                } catch (error) {
                    dispatch(showNotification({
                        type: 'error',
                        message: 'Failed to void journal entry',
                        duration: 5000,
                    }));
                } finally {
                    setConfirmDialog({ ...confirmDialog, open: false });
                }
            },
        });
    };

    const columns: Column<JournalEntry>[] = [
        {
            header: 'Reference',
            accessor: 'reference',
            className: 'font-medium',
            sortable: true,
            sortKey: 'reference',
        },
        {
            header: 'Date',
            accessor: (row) => formatDate(row.transaction_date),
            sortable: true,
            sortKey: 'transaction_date',
        },
        {
            header: 'Type',
            accessor: (row) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getTypeBadge(row.type)}`}>
                    {row.type.replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            header: 'Description',
            accessor: (row) => (
                <div className="max-w-xs truncate" title={row.description}>
                    {row.description}
                </div>
            ),
        },
        {
            header: 'Debits',
            accessor: (row) => (
                <div className="font-medium text-green-600">
                    {formatCurrency(getTotalDebits(row))}
                </div>
            ),
        },
        {
            header: 'Credits',
            accessor: (row) => (
                <div className="font-medium text-red-600">
                    {formatCurrency(getTotalCredits(row))}
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadge(row.status)}`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(row);
                        }}
                        className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    {row.status === 'POSTED' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVoid(row);
                            }}
                            className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm"
                        >
                            <XCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
            className: 'text-center',
        },
    ];

    return (
        <AppLayout>
            <Head title="Journal Entries" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
                        <p className="text-muted-foreground">
                            View and manage accounting journal entries
                        </p>
                    </div>
                    <Button className="rounded-full">
                        <Plus className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Entries Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalEntries}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All journal entries
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {summary.postedCount} posted, {summary.draftCount} draft
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Debits Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalDebits)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All debit transactions
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Across {summary.totalEntries} {summary.totalEntries === 1 ? 'entry' : 'entries'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Credits Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalCredits)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All credit transactions
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Across {summary.totalEntries} {summary.totalEntries === 1 ? 'entry' : 'entries'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Balance Status Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance Status</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${Math.abs(summary.totalDebits - summary.totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(summary.totalDebits - summary.totalCredits) < 0.01 ? '✓ Balanced' : '✗ Unbalanced'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Difference: {formatCurrency(Math.abs(summary.totalDebits - summary.totalCredits))}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {summary.postedCount} posted {summary.postedCount === 1 ? 'entry' : 'entries'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search journal entries..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleFilterChange({ search: e.target.value });
                                }}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={(value) => {
                            setTypeFilter(value);
                            handleFilterChange({ type: value });
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="GENERAL">General</SelectItem>
                                <SelectItem value="SALES">Sales</SelectItem>
                                <SelectItem value="PURCHASE">Purchase</SelectItem>
                                <SelectItem value="PAYMENT">Payment</SelectItem>
                                <SelectItem value="RECEIPT">Receipt</SelectItem>
                                <SelectItem value="EXPENSE">Expense</SelectItem>
                                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                                <SelectItem value="DEPRECIATION">Depreciation</SelectItem>
                                <SelectItem value="INVENTORY">Inventory</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(value) => {
                            setStatusFilter(value);
                            handleFilterChange({ status: value });
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="POSTED">Posted</SelectItem>
                                <SelectItem value="VOID">Void</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <DatePicker
                                date={dateFrom}
                                onDateChange={(date) => {
                                    setDateFrom(date);
                                    handleFilterChange({ date_from: date ? format(date, 'yyyy-MM-dd') : '' });
                                }}
                                placeholder="From"
                            />
                            <DatePicker
                                date={dateTo}
                                onDateChange={(date) => {
                                    setDateTo(date);
                                    handleFilterChange({ date_to: date ? format(date, 'yyyy-MM-dd') : '' });
                                }}
                                placeholder="To"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    {items.length > 0 || loading ? (
                        <>
                            <DataTable
                                data={items}
                                columns={columns}
                                loading={loading}
                                onRowClick={handleRowClick}
                                sortable
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
                    ) : (
                        <EmptyState
                            icon={EmptyIcons.File}
                            title="No journal entries"
                            description="Journal entries are automatically created from transactions or you can create manual entries."
                            action={{
                                label: 'Create Entry',
                                onClick: () => {},
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Journal Entry Detail Drawer */}
            <JournalEntryDetailDrawer
                open={showDrawer}
                onClose={() => setShowDrawer(false)}
                entryId={selectedEntryId}
                onVoided={handleDrawerVoided}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
            />
        </AppLayout>
    );
}

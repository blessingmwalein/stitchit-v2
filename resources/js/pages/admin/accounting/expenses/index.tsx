import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchExpenses, deleteExpense, Expense } from '@/store/slices/expensesSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { ExpenseModal } from '@/components/modals/ExpenseModal';
import { ExpenseDetailDrawer } from '@/components/drawers/ExpenseDetailDrawer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, TrendingUp, Calendar, DollarSign, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';

export default function ExpensesIndex() {
  const dispatch = useAppDispatch();
  const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state: any) => state.expenses);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | undefined>();
    const [dateTo, setDateTo] = useState<Date | undefined>();
    const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    const params: any = { page };
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
    if (paymentMethodFilter && paymentMethodFilter !== 'all') params.payment_method = paymentMethodFilter;
    if (dateFromFilter) params.date_from = dateFromFilter;
    if (dateToFilter) params.date_to = dateToFilter;
    if (sortField) {
      params.sort_field = sortField;
      params.sort_direction = sortDirection;
    }
    dispatch(fetchExpenses(params));
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    const params: any = { sort_field: field, sort_direction: newDirection };
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
    if (paymentMethodFilter && paymentMethodFilter !== 'all') params.payment_method = paymentMethodFilter;
    if (dateFromFilter) params.date_from = dateFromFilter;
    if (dateToFilter) params.date_to = dateToFilter;
    
    dispatch(fetchExpenses(params));
  };

  const handleDelete = async (expense: Expense) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Expense',
      description: `Are you sure you want to delete expense ${expense.reference}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await dispatch(deleteExpense(expense.id)).unwrap();
          dispatch(showNotification({
            type: 'success',
            message: 'Expense deleted successfully',
            duration: 3000,
          }));
          dispatch(fetchExpenses({}));
        } catch (error) {
          dispatch(showNotification({
            type: 'error',
            message: 'Failed to delete expense',
            duration: 5000,
          }));
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleModalSuccess = () => {
    dispatch(fetchExpenses({
      search: searchQuery,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      payment_method: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
      date_from: dateFromFilter || undefined,
      date_to: dateToFilter || undefined,
      sort_field: sortField || undefined,
      sort_direction: sortDirection,
    }));
    setSelectedExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleRowClick = (expense: Expense) => {
    setSelectedExpenseId(expense.id);
    setShowDrawer(true);
  };

  const handleEditFromDrawer = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleDrawerDeleted = () => {
    dispatch(fetchExpenses({}));
  };

  const handleFilterChange = (filters: { search?: string; category?: string; payment_method?: string; date_from?: string; date_to?: string }) => {
    const params: any = {};
    if (filters.search !== undefined) params.search = filters.search;
    if (filters.category !== undefined && filters.category !== 'all') params.category = filters.category;
    if (filters.payment_method !== undefined && filters.payment_method !== 'all') params.payment_method = filters.payment_method;
    if (filters.date_from !== undefined) params.date_from = filters.date_from;
    if (filters.date_to !== undefined) params.date_to = filters.date_to;
    dispatch(fetchExpenses(params));
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentMethodLabel = (method: string) => {
    return method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const weekExpenses = items.filter((expense: Expense) => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate >= startOfWeek;
    });

    const monthExpenses = items.filter((expense: Expense) => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate >= startOfMonth;
    });

    const totalWeek = weekExpenses.reduce((sum: number, exp: Expense) => sum + Number(exp.amount), 0);
    const totalMonth = monthExpenses.reduce((sum: number, exp: Expense) => sum + Number(exp.amount), 0);
    const totalAll = items.reduce((sum: number, exp: Expense) => sum + Number(exp.amount), 0);
    const averageExpense = items.length > 0 ? totalAll / items.length : 0;

    // Calculate week-over-week change
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekExpenses = items.filter((expense: Expense) => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate >= lastWeekStart && expenseDate < startOfWeek;
    });
    const totalLastWeek = lastWeekExpenses.reduce((sum: number, exp: Expense) => sum + Number(exp.amount), 0);
    const weekChange = totalLastWeek > 0 ? ((totalWeek - totalLastWeek) / totalLastWeek) * 100 : 0;

    return {
      weekCount: weekExpenses.length,
      weekTotal: totalWeek,
      weekChange,
      monthCount: monthExpenses.length,
      monthTotal: totalMonth,
      totalCount: items.length,
      averageExpense,
    };
  };

  const summary = calculateSummary();

  const columns: Column<Expense>[] = [
    {
      header: 'Reference',
      accessor: 'reference',
      className: 'font-medium',
      sortable: true,
      sortKey: 'reference',
    },
    {
      header: 'Date',
      accessor: (row) => formatDate(row.expense_date),
      sortable: true,
      sortKey: 'expense_date',
    },
    {
      header: 'Category',
      accessor: (row) => getCategoryLabel(row.category),
      className: 'text-sm',
    },
    {
      header: 'Vendor',
      accessor: (row) => row.vendor_name || '-',
    },
    {
      header: 'Amount',
      accessor: (row) => formatCurrency(row.amount),
      className: 'text-right font-semibold',
      sortable: true,
      sortKey: 'amount',
    },
    {
      header: 'Payment Method',
      accessor: (row) => getPaymentMethodLabel(row.payment_method),
      className: 'text-sm',
    },
    {
      header: 'Receipt #',
      accessor: (row) => row.receipt_number || '-',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
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
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="h-8 w-8 rounded-full"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
      className: 'text-center',
    },
  ];

  return (
    <AppLayout>
      <Head title="Expenses" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Expenses</h2>
              <p className="text-muted-foreground mt-1">
                Track and manage daily operational expenses
              </p>
            </div>
            <Button onClick={() => {
              setSelectedExpense(null);
              setShowModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Record Expense
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* This Week Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.weekTotal)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.weekCount} {summary.weekCount === 1 ? 'expense' : 'expenses'}
                </p>
                {summary.weekChange !== 0 && (
                  <div className={`flex items-center mt-2 text-xs ${summary.weekChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${summary.weekChange < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(summary.weekChange).toFixed(1)}% vs last week
                  </div>
                )}
              </CardContent>
            </Card>

            {/* This Month Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.monthTotal)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.monthCount} {summary.monthCount === 1 ? 'expense' : 'expenses'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>

            {/* Total Expenses Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time records
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            {/* Average Expense Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.averageExpense)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per transaction
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on {summary.totalCount} {summary.totalCount === 1 ? 'record' : 'records'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange({ search: e.target.value });
                }}
                className="max-w-md"
              />
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  handleFilterChange({ category: value });
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="WATER">Water</SelectItem>
                  <SelectItem value="INTERNET">Internet</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="OFFICE_SUPPLIES">Office Supplies</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="SALARIES">Salaries</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                  <SelectItem value="TAX">Tax</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={paymentMethodFilter}
                onValueChange={(value) => {
                  setPaymentMethodFilter(value);
                  handleFilterChange({ payment_method: value });
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
              <DatePicker
                date={dateFrom}
                onDateChange={(date) => {
                  setDateFrom(date);
                  handleFilterChange({ date_from: date ? format(date, 'yyyy-MM-dd') : '' });
                }}
                placeholder="From Date"
                className="w-[180px]"
              />
              <DatePicker
                date={dateTo}
                onDateChange={(date) => {
                  setDateTo(date);
                  handleFilterChange({ date_to: date ? format(date, 'yyyy-MM-dd') : '' });
                }}
                placeholder="To Date"
                className="w-[180px]"
              />
              {(searchQuery || (categoryFilter && categoryFilter !== 'all') || (paymentMethodFilter && paymentMethodFilter !== 'all') || dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('');
                    setPaymentMethodFilter('');
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    handleFilterChange({ search: '', category: 'all', payment_method: 'all', date_from: '', date_to: '' });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {items.length === 0 && !loading ? (
            <EmptyState
              icon={EmptyIcons.Receipt}
              title="No expenses recorded"
              description="Start tracking your operational expenses by recording your first expense."
              action={{
                label: 'Record Expense',
                onClick: () => {
                  setSelectedExpense(null);
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

      {/* Expense Modal */}
      <ExpenseModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onSuccess={handleModalSuccess}
      />

      {/* Expense Detail Drawer */}
      <ExpenseDetailDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        expenseId={selectedExpenseId}
        onEdit={handleEditFromDrawer}
        onDeleted={handleDrawerDeleted}
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Receipt,
  Edit,
  Trash2,
  FileText,
  BookOpen,
  Calendar,
  DollarSign,
  Building,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { deleteExpense, Expense as ReduxExpense } from '@/store/slices/expensesSlice';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
}

interface JournalEntryLine {
  id: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string | null;
  account: Account;
}

interface JournalEntry {
  id: number;
  reference: string;
  transaction_date: string;
  type: string;
  description: string;
  status: string;
  lines: JournalEntryLine[];
  created_at: string;
  posted_at: string | null;
}

interface ExpenseDetail {
  id: number;
  reference: string;
  expense_date: string;
  category: string;
  vendor_name: string | null;
  amount: number;
  payment_method: string;
  receipt_number: string | null;
  description: string | null;
  account: Account;
  journal_entry: JournalEntry | null;
  creator?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
  created_by?: {
    id: number;
    name: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  expenseId: number | null;
  onEdit?: (expense: ReduxExpense) => void;
  onDeleted?: () => void;
}

export function ExpenseDetailDrawer({ open, onClose, expenseId, onEdit, onDeleted }: Props) {
  const dispatch = useAppDispatch();
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && expenseId) {
      fetchExpenseDetails();
    }
  }, [open, expenseId]);

  const fetchExpenseDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/accounting/expenses/${expenseId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      console.log('Expense API Response:', response.data);
      const expenseData = response.data.data || response.data;
      console.log('Parsed Expense Data:', expenseData);
      setExpense(expenseData);
    } catch (error) {
      console.error('Error fetching expense details:', error);
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to load expense details',
        duration: 5000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    
    if (confirm(`Are you sure you want to delete expense ${expense.reference}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteExpense(expense.id)).unwrap();
        dispatch(showNotification({
          type: 'success',
          message: 'Expense deleted successfully',
          duration: 3000,
        }));
        onDeleted?.();
        onClose();
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to delete expense',
          duration: 5000,
        }));
      }
    }
  };

  const getCategoryLabel = (category: string | null | undefined) => {
    if (!category) return 'N/A';
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentMethodLabel = (method: string | null | undefined) => {
    if (!method) return 'N/A';
    return method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
      DRAFT: { label: 'Draft', variant: 'secondary' },
      POSTED: { label: 'Posted', variant: 'default' },
      VOID: { label: 'Void', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!expense && !loading) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[75vw] sm:max-w-[75vw] overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : expense ? (
          <div className="h-full flex flex-col overflow-hidden">
            <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                    <Receipt className="h-6 w-6" />
                    {expense.reference}
                  </SheetTitle>
                  <SheetDescription className="flex items-center gap-2 mt-1">
                    <span>{getCategoryLabel(expense.category)}</span>
                    <span>•</span>
                    <span>{formatCurrency(expense.amount)}</span>
                  </SheetDescription>
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(expense as ReduxExpense)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-4 grid w-full grid-cols-2 bg-transparent h-auto p-0 border-b flex-shrink-0">
                <TabsTrigger 
                  value="details" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <FileText className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="journal" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Journal Entry</span>
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                {/* Basic Information */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Expense Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Reference</p>
                      <p className="font-mono font-medium">{expense.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(expense.expense_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{getCategoryLabel(expense.category)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-bold text-lg flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{getPaymentMethodLabel(expense.payment_method)}</p>
                    </div>
                    {expense.receipt_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Receipt Number</p>
                        <p className="font-medium font-mono">{expense.receipt_number}</p>
                      </div>
                    )}
                    {expense.vendor_name && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Vendor</p>
                        <p className="font-medium flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {expense.vendor_name}
                        </p>
                      </div>
                    )}
                  </div>
                  {expense.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm mt-1">{expense.description}</p>
                    </div>
                  )}
                </div>

                {/* Account Affected */}
                {expense.account && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Account Affected</h3>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">{expense.account.code}</p>
                          <p className="font-semibold text-lg">{expense.account.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{expense.account.type}</Badge>
                            <Badge variant="secondary">{expense.account.category?.replace(/_/g, ' ') || 'N/A'}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(expense.account.balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Record Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDateTime(expense.created_at)}</p>
                      {expense.creator?.name && (
                        <p className="text-xs text-muted-foreground mt-1">by {expense.creator.name}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDateTime(expense.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Journal Entry Tab */}
              <TabsContent value="journal" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                {expense.journal_entry ? (
                  <>
                    {/* Journal Entry Header */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Journal Entry
                        </h3>
                        {getStatusBadge(expense.journal_entry.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Reference</p>
                          <p className="font-mono font-medium">{expense.journal_entry.reference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction Date</p>
                          <p className="font-medium">{formatDate(expense.journal_entry.transaction_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{expense.journal_entry.type}</p>
                        </div>
                        {expense.journal_entry.posted_at && (
                          <div>
                            <p className="text-sm text-muted-foreground">Posted At</p>
                            <p className="font-medium text-xs">{formatDateTime(expense.journal_entry.posted_at)}</p>
                          </div>
                        )}
                      </div>
                      {expense.journal_entry.description && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="text-sm mt-1">{expense.journal_entry.description}</p>
                        </div>
                      )}
                    </div>

                    {/* T-Account Style Journal Entry */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/30 px-4 py-3 border-b">
                        <h4 className="font-semibold text-sm">Journal Entry Lines</h4>
                      </div>
                      
                      {/* T-Account Grid */}
                      <div className="grid grid-cols-2 divide-x">
                        {/* DEBIT (Left Side) */}
                        <div className="bg-green-50/30 dark:bg-green-950/10">
                          <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 border-b">
                            <h5 className="font-semibold text-sm text-green-700 dark:text-green-400">DEBIT</h5>
                          </div>
                          <div className="divide-y">
                            {expense.journal_entry.lines
                              .filter(line => line.type === 'DEBIT')
                              .map((line) => (
                                <div key={line.id} className="p-4 hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded">
                                          {line.account.code}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-sm">{line.account.name}</p>
                                      {line.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{line.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-500">
                                      {formatCurrency(line.amount)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            {expense.journal_entry.lines.filter(l => l.type === 'DEBIT').length === 0 && (
                              <div className="p-8 text-center text-sm text-muted-foreground">
                                No debit entries
                              </div>
                            )}
                          </div>
                          {/* Debit Total */}
                          <div className="border-t-2 border-green-600 bg-green-100/50 dark:bg-green-900/20 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">Total:</span>
                              <span className="text-lg font-bold text-green-600 dark:text-green-500">
                                {formatCurrency(expense.journal_entry.lines.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + Number(l.amount), 0))}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CREDIT (Right Side) */}
                        <div className="bg-red-50/30 dark:bg-red-950/10">
                          <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 border-b">
                            <h5 className="font-semibold text-sm text-red-700 dark:text-red-400">CREDIT</h5>
                          </div>
                          <div className="divide-y">
                            {expense.journal_entry.lines
                              .filter(line => line.type === 'CREDIT')
                              .map((line) => (
                                <div key={line.id} className="p-4 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded">
                                          {line.account.code}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-sm">{line.account.name}</p>
                                      {line.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{line.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-red-600 dark:text-red-500">
                                      {formatCurrency(line.amount)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            {expense.journal_entry.lines.filter(l => l.type === 'CREDIT').length === 0 && (
                              <div className="p-8 text-center text-sm text-muted-foreground">
                                No credit entries
                              </div>
                            )}
                          </div>
                          {/* Credit Total */}
                          <div className="border-t-2 border-red-600 bg-red-100/50 dark:bg-red-900/20 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">Total:</span>
                              <span className="text-lg font-bold text-red-600 dark:text-red-500">
                                {formatCurrency(expense.journal_entry.lines.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + Number(l.amount), 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Balance Verification Footer */}
                      <div className="bg-muted/50 px-4 py-3 border-t">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-semibold">Entry Balance:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            Math.abs(
                              expense.journal_entry.lines.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + Number(l.amount), 0) -
                              expense.journal_entry.lines.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + Number(l.amount), 0)
                            ) < 0.01 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(
                              expense.journal_entry.lines.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + Number(l.amount), 0) -
                              expense.journal_entry.lines.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + Number(l.amount), 0)
                            ) < 0.01 ? '✓ Balanced' : '✗ Unbalanced'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold">No Journal Entry</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This expense does not have an associated journal entry.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

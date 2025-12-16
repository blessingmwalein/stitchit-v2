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
import {
  BookOpen,
  XCircle,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { voidJournalEntry } from '@/store/slices/journalEntriesSlice';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  category: string;
}

interface JournalEntryLine {
  id: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string | null;
  account: Account;
}

interface JournalEntryDetail {
  id: number;
  reference: string;
  transaction_date: string;
  type: string;
  description: string;
  status: string;
  lines: JournalEntryLine[];
  created_at: string;
  posted_at: string | null;
  creator?: {
    id: number;
    name: string;
  };
  poster?: {
    id: number;
    name: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  entryId: number | null;
  onVoided?: () => void;
}

export function JournalEntryDetailDrawer({ open, onClose, entryId, onVoided }: Props) {
  const dispatch = useAppDispatch();
  const [entry, setEntry] = useState<JournalEntryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  useEffect(() => {
    if (open && entryId) {
      fetchEntryDetails();
    }
  }, [open, entryId]);

  const fetchEntryDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/accounting/journal-entries/${entryId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      console.log('Journal Entry API Response:', response.data);
      const entryData = response.data.data || response.data;
      console.log('Parsed Entry Data:', entryData);
      setEntry(entryData);
    } catch (error) {
      console.error('Error fetching journal entry details:', error);
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to load journal entry details',
        duration: 5000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = () => {
    if (!entry) return;

    setConfirmDialog({
      open: true,
      title: 'Void Journal Entry',
      description: `Are you sure you want to void journal entry ${entry.reference}? This will reverse all account balances and cannot be undone.`,
      onConfirm: async () => {
        try {
          await dispatch(voidJournalEntry(entry.id)).unwrap();
          dispatch(showNotification({
            type: 'success',
            message: 'Journal entry voided successfully',
            duration: 3000,
          }));
          setConfirmDialog({ ...confirmDialog, open: false });
          onVoided?.();
          onClose();
        } catch (error) {
          dispatch(showNotification({
            type: 'error',
            message: 'Failed to void journal entry',
            duration: 5000,
          }));
        }
      },
    });
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

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      GENERAL: 'bg-gray-100 text-gray-700',
      SALES: 'bg-blue-100 text-blue-700',
      PURCHASE: 'bg-purple-100 text-purple-700',
      PAYMENT: 'bg-yellow-100 text-yellow-700',
      RECEIPT: 'bg-green-100 text-green-700',
      EXPENSE: 'bg-orange-100 text-orange-700',
      ADJUSTMENT: 'bg-red-100 text-red-700',
      DEPRECIATION: 'bg-pink-100 text-pink-700',
      INVENTORY: 'bg-indigo-100 text-indigo-700',
    };
    const colorClass = typeColors[type] || 'bg-gray-100 text-gray-700';
    return <Badge className={`${colorClass}`}>{type.replace(/_/g, ' ')}</Badge>;
  };

  if (!entry && !loading) return null;

  const totalDebits = entry?.lines.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + Number(l.amount), 0) || 0;
  const totalCredits = entry?.lines.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + Number(l.amount), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-[90vw] overflow-y-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : entry ? (
            <div className="h-full flex flex-col overflow-hidden">
              <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                      <BookOpen className="h-6 w-6" />
                      {entry.reference}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1">
                      <span>{formatDate(entry.transaction_date)}</span>
                      <span>•</span>
                      {getTypeBadge(entry.type)}
                      <span>•</span>
                      {getStatusBadge(entry.status)}
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === 'POSTED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleVoid}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Void Entry
                      </Button>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
                {/* Entry Information */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Entry Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Reference</p>
                      <p className="font-mono font-medium">{entry.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.transaction_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <div className="mt-1">{getTypeBadge(entry.type)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(entry.status)}</div>
                    </div>
                  </div>
                  {entry.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm mt-1">{entry.description}</p>
                    </div>
                  )}
                </div>

                {/* T-Account Style Journal Entry Lines */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm flex items-center justify-between">
                      <span>Journal Entry Lines - T-Account View</span>
                      <span className={`text-xs ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
                      </span>
                    </h4>
                  </div>
                  
                  {/* T-Account Grid */}
                  <div className="grid grid-cols-2 divide-x min-h-[300px]">
                    {/* DEBIT (Left Side) */}
                    <div className="bg-green-50/30 dark:bg-green-950/10">
                      <div className="bg-green-100 dark:bg-green-900/30 px-4 py-3 border-b sticky top-0">
                        <h5 className="font-semibold text-green-700 dark:text-green-400 flex items-center justify-between">
                          <span>DEBIT</span>
                          <span className="text-xs font-normal">
                            {entry.lines.filter(l => l.type === 'DEBIT').length} {entry.lines.filter(l => l.type === 'DEBIT').length === 1 ? 'entry' : 'entries'}
                          </span>
                        </h5>
                      </div>
                      <div className="divide-y">
                        {entry.lines
                          .filter(line => line.type === 'DEBIT')
                          .map((line) => (
                            <div key={line.id} className="p-4 hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded border">
                                        {line.account.code}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-sm leading-tight">{line.account.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">{line.account.type}</Badge>
                                      <span className="text-xs text-muted-foreground">{line.account.category?.replace(/_/g, ' ')}</span>
                                    </div>
                                  </div>
                                </div>
                                {line.description && (
                                  <p className="text-xs text-muted-foreground italic pl-2 border-l-2 border-green-300">
                                    {line.description}
                                  </p>
                                )}
                                <div className="text-right pt-2 border-t border-green-200">
                                  <p className="text-lg font-bold text-green-600 dark:text-green-500">
                                    {formatCurrency(line.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        {entry.lines.filter(l => l.type === 'DEBIT').length === 0 && (
                          <div className="p-12 text-center text-sm text-muted-foreground">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p>No debit entries</p>
                          </div>
                        )}
                      </div>
                      {/* Debit Total */}
                      <div className="border-t-2 border-green-600 bg-green-100/70 dark:bg-green-900/30 px-4 py-3 sticky bottom-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Total Debits:</span>
                          <span className="text-xl font-bold text-green-600 dark:text-green-500">
                            {formatCurrency(totalDebits)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CREDIT (Right Side) */}
                    <div className="bg-red-50/30 dark:bg-red-950/10">
                      <div className="bg-red-100 dark:bg-red-900/30 px-4 py-3 border-b sticky top-0">
                        <h5 className="font-semibold text-red-700 dark:text-red-400 flex items-center justify-between">
                          <span>CREDIT</span>
                          <span className="text-xs font-normal">
                            {entry.lines.filter(l => l.type === 'CREDIT').length} {entry.lines.filter(l => l.type === 'CREDIT').length === 1 ? 'entry' : 'entries'}
                          </span>
                        </h5>
                      </div>
                      <div className="divide-y">
                        {entry.lines
                          .filter(line => line.type === 'CREDIT')
                          .map((line) => (
                            <div key={line.id} className="p-4 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded border">
                                        {line.account.code}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-sm leading-tight">{line.account.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">{line.account.type}</Badge>
                                      <span className="text-xs text-muted-foreground">{line.account.category?.replace(/_/g, ' ')}</span>
                                    </div>
                                  </div>
                                </div>
                                {line.description && (
                                  <p className="text-xs text-muted-foreground italic pl-2 border-l-2 border-red-300">
                                    {line.description}
                                  </p>
                                )}
                                <div className="text-right pt-2 border-t border-red-200">
                                  <p className="text-lg font-bold text-red-600 dark:text-red-500">
                                    {formatCurrency(line.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        {entry.lines.filter(l => l.type === 'CREDIT').length === 0 && (
                          <div className="p-12 text-center text-sm text-muted-foreground">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p>No credit entries</p>
                          </div>
                        )}
                      </div>
                      {/* Credit Total */}
                      <div className="border-t-2 border-red-600 bg-red-100/70 dark:bg-red-900/30 px-4 py-3 sticky bottom-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Total Credits:</span>
                          <span className="text-xl font-bold text-red-600 dark:text-red-500">
                            {formatCurrency(totalCredits)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance Verification Footer */}
                  <div className="bg-muted/50 px-4 py-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Difference: </span>
                        <span className="font-mono font-medium">
                          {formatCurrency(Math.abs(totalDebits - totalCredits))}
                        </span>
                      </div>
                      <div className={`font-bold flex items-center gap-2 ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? '✓ Entry is Balanced' : '✗ Entry is Not Balanced'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Record Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDateTime(entry.created_at)}</p>
                      {entry.creator?.name && (
                        <p className="text-xs text-muted-foreground mt-1">by {entry.creator.name}</p>
                      )}
                    </div>
                    {entry.posted_at && (
                      <div>
                        <p className="text-muted-foreground">Posted</p>
                        <p className="font-medium">{formatDateTime(entry.posted_at)}</p>
                        {entry.poster?.name && (
                          <p className="text-xs text-muted-foreground mt-1">by {entry.poster.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </>
  );
}

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface JournalEntryLine {
  account_id: number | string;
  type: 'DEBIT' | 'CREDIT' | '';
  amount: string;
  description?: string;
}

interface JournalEntry {
  id: number;
  reference: string;
  transaction_date: string;
  entry_type: string;
  status: string;
  description: string | null;
  lines?: any[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  journalEntry?: JournalEntry | null;
  accounts: Account[];
  onSuccess?: () => void;
}

export function JournalEntryModal({ open, onClose, journalEntry, accounts, onSuccess }: Props) {
  const isEdit = !!journalEntry;
  
  const [formData, setFormData] = useState({
    transaction_date: journalEntry?.transaction_date || new Date().toISOString().split('T')[0],
    entry_type: journalEntry?.entry_type || '',
    description: journalEntry?.description || '',
  });

  const [lines, setLines] = useState<JournalEntryLine[]>(
    journalEntry?.lines?.map(line => ({
      account_id: line.account_id,
      type: line.type,
      amount: line.amount.toString(),
      description: line.description || '',
    })) || [
      { account_id: '', type: '', amount: '', description: '' },
      { account_id: '', type: '', amount: '', description: '' },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (open && journalEntry) {
      setFormData({
        transaction_date: journalEntry.transaction_date,
        entry_type: journalEntry.entry_type,
        description: journalEntry.description || '',
      });
      setLines(
        journalEntry.lines?.map(line => ({
          account_id: line.account_id,
          type: line.type,
          amount: line.amount.toString(),
          description: line.description || '',
        })) || [
          { account_id: '', type: '', amount: '', description: '' },
          { account_id: '', type: '', amount: '', description: '' },
        ]
      );
    } else if (open && !journalEntry) {
      setFormData({
        transaction_date: new Date().toISOString().split('T')[0],
        entry_type: '',
        description: '',
      });
      setLines([
        { account_id: '', type: '', amount: '', description: '' },
        { account_id: '', type: '', amount: '', description: '' },
      ]);
    }
    setErrors({});
  }, [open, journalEntry]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
    setErrors(prev => ({ ...prev, [`line_${index}_${field}`]: '' }));
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', type: '', amount: '', description: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Transaction date is required';
    }
    if (!formData.entry_type) {
      newErrors.entry_type = 'Entry type is required';
    }

    let totalDebits = 0;
    let totalCredits = 0;
    
    lines.forEach((line, index) => {
      if (!line.account_id) {
        newErrors[`line_${index}_account_id`] = 'Account is required';
      }
      if (!line.type) {
        newErrors[`line_${index}_type`] = 'Type is required';
      }
      if (!line.amount || parseFloat(line.amount) <= 0) {
        newErrors[`line_${index}_amount`] = 'Amount must be greater than 0';
      }

      const amount = parseFloat(line.amount) || 0;
      if (line.type === 'DEBIT') {
        totalDebits += amount;
      } else if (line.type === 'CREDIT') {
        totalCredits += amount;
      }
    });

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      newErrors.balance = 'Total debits must equal total credits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    const data = {
      ...formData,
      lines: lines.map(line => ({
        account_id: parseInt(line.account_id.toString()),
        type: line.type,
        amount: parseFloat(line.amount),
        description: line.description || null,
      })),
    };

    if (isEdit && journalEntry) {
      router.put(`/admin/accounting/journal-entries/${journalEntry.id}`, data, {
        onSuccess: () => {
          setIsLoading(false);
          onSuccess?.();
          onClose();
        },
        onError: (errors) => {
          setIsLoading(false);
          setErrors(errors as Record<string, string>);
        },
      });
    } else {
      router.post('/admin/accounting/journal-entries', data, {
        onSuccess: () => {
          setIsLoading(false);
          onSuccess?.();
          onClose();
        },
        onError: (errors) => {
          setIsLoading(false);
          setErrors(errors as Record<string, string>);
        },
      });
    }
  };

  const totalDebits = lines.reduce((sum, line) => {
    return line.type === 'DEBIT' ? sum + (parseFloat(line.amount) || 0) : sum;
  }, 0);

  const totalCredits = lines.reduce((sum, line) => {
    return line.type === 'CREDIT' ? sum + (parseFloat(line.amount) || 0) : sum;
  }, 0);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Journal Entry' : 'Create Journal Entry'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the journal entry details below.' : 'Enter the journal entry details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Transaction Date *</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => handleChange('transaction_date', e.target.value)}
                disabled={isLoading}
              />
              {errors.transaction_date && (
                <p className="text-sm text-red-600">{errors.transaction_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_type">Entry Type *</Label>
              <Select
                value={formData.entry_type}
                onValueChange={(value) => handleChange('entry_type', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General Journal</SelectItem>
                  <SelectItem value="SALES">Sales</SelectItem>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="RECEIPT">Receipt</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="OPENING_BALANCE">Opening Balance</SelectItem>
                  <SelectItem value="CLOSING">Closing</SelectItem>
                </SelectContent>
              </Select>
              {errors.entry_type && (
                <p className="text-sm text-red-600">{errors.entry_type}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
              placeholder="Optional description for this journal entry"
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Journal Entry Lines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Journal Entry Lines</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Line
              </Button>
            </div>

            {errors.balance && (
              <p className="text-sm text-red-600 font-medium">{errors.balance}</p>
            )}

            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Account *</Label>
                    <Select
                      value={line.account_id.toString()}
                      onValueChange={(value) => handleLineChange(index, 'account_id', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`line_${index}_account_id`] && (
                      <p className="text-xs text-red-600">{errors[`line_${index}_account_id`]}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Type *</Label>
                    <Select
                      value={line.type}
                      onValueChange={(value) => handleLineChange(index, 'type', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEBIT">Debit</SelectItem>
                        <SelectItem value="CREDIT">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors[`line_${index}_type`] && (
                      <p className="text-xs text-red-600">{errors[`line_${index}_type`]}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.amount}
                      onChange={(e) => handleLineChange(index, 'amount', e.target.value)}
                      disabled={isLoading}
                      className="h-9"
                      placeholder="0.00"
                    />
                    {errors[`line_${index}_amount`] && (
                      <p className="text-xs text-red-600">{errors[`line_${index}_amount`]}</p>
                    )}
                  </div>

                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      type="text"
                      value={line.description || ''}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      disabled={isLoading}
                      className="h-9"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={isLoading || lines.length <= 2}
                      className="h-9 px-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex justify-end gap-8 text-sm font-medium p-4 bg-muted rounded-lg">
              <div>
                <span className="text-muted-foreground">Total Debits: </span>
                <span className={totalDebits > 0 ? 'text-blue-600' : ''}>
                  ${totalDebits.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Credits: </span>
                <span className={totalCredits > 0 ? 'text-green-600' : ''}>
                  ${totalCredits.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Difference: </span>
                <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                  ${Math.abs(totalDebits - totalCredits).toFixed(2)}
                  {isBalanced && ' ✓'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isBalanced}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

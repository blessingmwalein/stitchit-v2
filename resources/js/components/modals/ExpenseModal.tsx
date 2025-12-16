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
import { DatePicker } from '@/components/ui/date-picker';
import { router } from '@inertiajs/react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';

interface Expense {
  id: number;
  reference: string;
  expense_date: string;
  category: string;
  vendor_name: string | null;
  amount: number;
  payment_method: string;
  receipt_number: string | null;
  description: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  expense?: Expense | null;
  onSuccess?: () => void;
}

export function ExpenseModal({ open, onClose, expense, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(
    expense?.expense_date ? new Date(expense.expense_date) : new Date()
  );
  const [formData, setFormData] = useState({
    category: expense?.category || '',
    vendor_name: expense?.vendor_name || '',
    amount: expense?.amount?.toString() || '',
    payment_method: expense?.payment_method || '',
    receipt_number: expense?.receipt_number || '',
    description: expense?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  React.useEffect(() => {
    if (open) {
      if (expense) {
        setExpenseDate(expense.expense_date ? new Date(expense.expense_date) : new Date());
        setFormData({
          category: expense.category || '',
          vendor_name: expense.vendor_name || '',
          amount: expense.amount?.toString() || '',
          payment_method: expense.payment_method || '',
          receipt_number: expense.receipt_number || '',
          description: expense.description || '',
        });
      } else {
        setExpenseDate(new Date());
        setFormData({
          category: '',
          vendor_name: '',
          amount: '',
          payment_method: '',
          receipt_number: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [open, expense]);

  const handleClose = () => {
    onClose();
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!expenseDate) {
      newErrors.expense_date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        expense_date: expenseDate ? format(expenseDate, 'yyyy-MM-dd') : '',
        category: formData.category,
        vendor_name: formData.vendor_name || null,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        receipt_number: formData.receipt_number || null,
        description: formData.description || null,
      };

      const response = expense
        ? await axios.put(`/admin/accounting/expenses/${expense.id}`, payload)
        : await axios.post('/admin/accounting/expenses', payload);

      dispatch(showNotification({
        type: 'success',
        message: response.data.message || 'Expense saved successfully',
        duration: 3000,
      }));

      // Close modal, then refresh the Expenses page via Inertia
      handleClose();
      onSuccess?.();
      router.visit('/admin/accounting/expenses', {
        preserveState: false,
        preserveScroll: true,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save expense';
      const validationErrors = error.response?.data?.errors || {};
      
      setErrors(validationErrors);
      dispatch(showNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
          <DialogDescription>
            {expense ? 'Update expense details below.' : 'Enter expense details to record a new transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Date and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_date">Date *</Label>
              <DatePicker
                date={expenseDate}
                onDateChange={setExpenseDate}
                placeholder="Select date"
                disabled={loading}
              />
              {errors.expense_date && (
                <p className="text-sm text-red-500">{errors.expense_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  <SelectItem value="FOOD">Food & Meals</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="WATER">Water</SelectItem>
                  <SelectItem value="INTERNET">Internet</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="OFFICE_SUPPLIES">Office Supplies</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance & Repairs</SelectItem>
                  <SelectItem value="SALARIES">Salaries & Wages</SelectItem>
                  <SelectItem value="MARKETING">Marketing & Advertising</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                  <SelectItem value="TAX">Tax</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Row 2: Amount and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-red-500">{errors.payment_method}</p>
              )}
            </div>
          </div>

          {/* Row 3: Vendor Name and Receipt Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                placeholder="Enter vendor name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_number">Receipt Number</Label>
              <Input
                id="receipt_number"
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="Enter receipt number"
                disabled={loading}
              />
            </div>
          </div>

          {/* Description (Full Width) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this expense"
              rows={2}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {expense ? 'Update Expense' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

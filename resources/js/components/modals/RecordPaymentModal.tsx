import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  balanceDue: number | string;
  onSuccess?: () => void;
}

export function RecordPaymentModal({ open, onClose, orderId, balanceDue, onSuccess }: RecordPaymentModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paidDate, setPaidDate] = useState<Date | undefined>(new Date());

  const [formData, setFormData] = useState({
    amount: '',
    paid_at: new Date().toISOString().split('T')[0],
    method: 'cash',
    type: 'deposit',
    reference: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);

    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Valid amount is required';
    } else if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amount > balanceDue) {
      newErrors.amount = `Amount cannot exceed balance due ($${balanceDue.toFixed(2)})`;
    }

    if (!paidDate) {
      newErrors.paid_at = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/admin/orders/${orderId}/payment`, {
        ...formData,
        paid_at: paidDate ? format(paidDate, 'yyyy-MM-dd') : '',
        amount: parseFloat(formData.amount),
      });

      dispatch(showNotification({
        type: 'success',
        message: 'Payment recorded successfully',
      }));

      onSuccess?.();
      onClose();
      
      // Reset form
      setPaidDate(new Date());
      setFormData({
        amount: '',
        method: 'cash',
        type: 'deposit',
        reference: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to record payment';
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
      }

      dispatch(showNotification({
        type: 'error',
        message: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm text-yellow-800">
                Balance Due: <span className="font-bold text-lg">${Number(balanceDue || 0).toFixed(2)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_at">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={paidDate}
                onDateChange={setPaidDate}
                placeholder="Select payment date"
              />
              {errors.paid_at && (
                <p className="text-sm text-red-600">{errors.paid_at}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.method && (
                <p className="text-sm text-red-600">{errors.method}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Transaction ID, Check number, etc."
              />
              {errors.reference && (
                <p className="text-sm text-red-600">{errors.reference}</p>
              )}
            </div>


          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#FF8A50] hover:bg-[#FF9B71]">
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

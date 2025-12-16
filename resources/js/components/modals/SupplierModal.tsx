import React, { useState, useEffect } from 'react';
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
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSuccess?: () => void;
}

export function SupplierModal({ open, onClose, supplier, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
    }
    setErrors({});
  }, [supplier, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (supplier) {
        await axios.put(`/admin/suppliers/${supplier.id}`, formData);
        dispatch(
          showNotification({
            type: 'success',
            message: 'Supplier updated successfully!',
            duration: 5000,
          })
        );
      } else {
        await axios.post('/admin/suppliers', formData);
        dispatch(
          showNotification({
            type: 'success',
            message: 'Supplier created successfully!',
            duration: 5000,
          })
        );
      }

      onClose();
      onSuccess?.();
    } catch (error: any) {
      dispatch(
        showNotification({
          type: 'error',
          message: error.response?.data?.message || 'Failed to save supplier',
          duration: 5000,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Create New Supplier'}</DialogTitle>
          <DialogDescription>
            {supplier
              ? 'Update supplier information and contact details'
              : 'Add a new supplier to your vendor list'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Supplier Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., ABC Materials Ltd"
              required
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="supplier@example.com"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, city, state, postal code..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information about this supplier..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

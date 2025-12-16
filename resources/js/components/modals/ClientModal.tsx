import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: {
    id: number;
    full_name: string;
    nickname?: string;
    phone: string;
    address?: string;
    gender?: string;
    notes?: string;
  };
  onSuccess?: () => void;
}

export function ClientModal({ open, onClose, client, onSuccess }: ClientModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    phone: '',
    address: '',
    gender: '',
    notes: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        full_name: client.full_name || '',
        nickname: client.nickname || '',
        phone: client.phone || '',
        address: client.address || '',
        gender: client.gender || '',
        notes: client.notes || '',
      });
    } else {
      setFormData({
        full_name: '',
        nickname: '',
        phone: '',
        address: '',
        gender: '',
        notes: '',
      });
    }
    setErrors({});
  }, [client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.full_name.trim() && !formData.nickname.trim()) {
      newErrors.full_name = 'Full name or nickname is required';
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
      if (client?.id) {
        // Update existing client
        await axios.put(`/admin/clients/${client.id}`, formData);
      } else {
        // Create new client
        await axios.post('/admin/clients', formData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save client';
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Edit Client' : 'Create New Client'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="Optional nickname"
              />
              {errors.nickname && (
                <p className="text-sm text-red-600">{errors.nickname}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#FF8A50] hover:bg-[#FF9B71]">
              {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

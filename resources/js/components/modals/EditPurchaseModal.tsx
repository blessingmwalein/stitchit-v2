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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';

interface Supplier {
  id: number;
  name: string;
}

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  unit: string;
}

interface PurchaseOrderLine {
  id?: number;
  inventory_item_id: string;
  quantity_ordered: string;
  unit_cost: string;
}

interface PurchaseOrder {
  id: number;
  reference: string;
  supplier_id: number;
  expected_date: string | null;
  notes: string | null;
  lines?: Array<{
    id: number;
    inventory_item_id: number;
    quantity_ordered: number;
    unit_cost: number;
  }>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  onSuccess?: () => void;
}

export function EditPurchaseModal({ open, onClose, purchaseOrder, suppliers, inventoryItems, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_date: '',
    notes: '',
  });
  const [lines, setLines] = useState<PurchaseOrderLine[]>([
    { inventory_item_id: '', quantity_ordered: '', unit_cost: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: async () => {},
  });

  // Populate form when purchase order changes
  useEffect(() => {
    if (purchaseOrder && open) {
      setFormData({
        supplier_id: purchaseOrder.supplier_id?.toString() || '',
        expected_date: purchaseOrder.expected_date || '',
        notes: purchaseOrder.notes || '',
      });

      if (purchaseOrder.lines && purchaseOrder.lines.length > 0) {
        setLines(
          purchaseOrder.lines.map((line) => ({
            id: line.id,
            inventory_item_id: line.inventory_item_id.toString(),
            quantity_ordered: line.quantity_ordered.toString(),
            unit_cost: line.unit_cost.toString(),
          }))
        );
      } else {
        setLines([{ inventory_item_id: '', quantity_ordered: '', unit_cost: '' }]);
      }
    }
  }, [purchaseOrder, open]);

  const handleAddLine = () => {
    setLines([...lines, { inventory_item_id: '', quantity_ordered: '', unit_cost: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index: number, field: keyof PurchaseOrderLine, value: string) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const getSelectedItem = (itemId: string) => {
    return inventoryItems.find((item) => item.id.toString() === itemId);
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => {
      const qty = parseFloat(line.quantity_ordered) || 0;
      const cost = parseFloat(line.unit_cost) || 0;
      return sum + qty * cost;
    }, 0);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    const validLines = lines.filter(
      (line) => line.inventory_item_id && line.quantity_ordered && line.unit_cost
    );

    if (validLines.length === 0) {
      newErrors.lines = 'At least one valid line item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !purchaseOrder) return;

    setConfirmDialog({
      open: true,
      action: async () => {
        await performUpdate();
      },
    });
  };

  const performUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        supplier_id: parseInt(formData.supplier_id),
        expected_date: formData.expected_date || null,
        notes: formData.notes || null,
        lines: lines
          .filter((line) => line.inventory_item_id && line.quantity_ordered && line.unit_cost)
          .map((line) => ({
            id: line.id,
            inventory_item_id: parseInt(line.inventory_item_id),
            quantity_ordered: parseFloat(line.quantity_ordered),
            unit_cost: parseFloat(line.unit_cost),
          })),
      };

      console.log('Updating purchase order:', payload);

      await axios.put(`/admin/purchases/${purchaseOrder!.id}`, payload);

      dispatch(
        showNotification({
          type: 'success',
          message: 'Purchase order updated successfully!',
          duration: 5000,
        })
      );

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      dispatch(
        showNotification({
          type: 'error',
          message: error.response?.data?.message || 'Failed to update purchase order',
          duration: 5000,
        })
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplier_id: '',
      expected_date: '',
      notes: '',
    });
    setLines([{ inventory_item_id: '', quantity_ordered: '', unit_cost: '' }]);
    setErrors({});
    onClose();
  };

  if (!purchaseOrder) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Purchase Order - {purchaseOrder.reference}</DialogTitle>
          <DialogDescription>
            Update purchase order details and line items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier */}
          <div className="space-y-2">
            <Label>
              Supplier <span className="text-red-500">*</span>
            </Label>
            {suppliers.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  No suppliers available. Please <a href="/admin/suppliers" className="underline font-medium">create a supplier</a> first.
                </p>
              </div>
            ) : (
              <>
                <Select 
                  value={formData.supplier_id} 
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplier_id && <p className="text-sm text-red-600">{errors.supplier_id}</p>}
              </>
            )}
          </div>

          {/* Expected Delivery Date */}
          <div className="space-y-2">
            <Label htmlFor="expected_date">Expected Delivery Date</Label>
            <DatePicker
              date={formData.expected_date ? new Date(formData.expected_date) : undefined}
              onDateChange={(date) => setFormData({ ...formData, expected_date: date ? format(date, 'yyyy-MM-dd') : '' })}
              placeholder="Select delivery date"
            />
          </div>

          {/* Order Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Order Lines <span className="text-red-500">*</span>
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                <Plus className="h-4 w-4 mr-1" />
                Add Line
              </Button>
            </div>

            {errors.lines && <p className="text-sm text-red-600">{errors.lines}</p>}

            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              {lines.map((line, index) => {
                const selectedItem = getSelectedItem(line.inventory_item_id);
                const lineTotal = (parseFloat(line.quantity_ordered) || 0) * (parseFloat(line.unit_cost) || 0);

                return (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-background">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {/* Item */}
                      <div className="space-y-1">
                        <Label className="text-xs">Item</Label>
                        <Select
                          value={line.inventory_item_id}
                          onValueChange={(value) => handleLineChange(index, 'inventory_item_id', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.sku} - {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity {selectedItem && `(${selectedItem.unit})`}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={line.quantity_ordered}
                          onChange={(e) => handleLineChange(index, 'quantity_ordered', e.target.value)}
                          className="h-9"
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={line.unit_cost}
                          onChange={(e) => handleLineChange(index, 'unit_cost', e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Line Total & Remove */}
                    <div className="flex flex-col items-end gap-1 min-w-[100px]">
                      <Label className="text-xs">Subtotal</Label>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">${lineTotal.toFixed(2)}</span>
                        {lines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleRemoveLine(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex justify-end items-center gap-3 p-3 border-t-2 bg-muted/30 rounded">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or special instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Purchase Order'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.action}
        title="Update Purchase Order?"
        description="Are you sure you want to update this purchase order? This will modify the order details and line items."
        confirmText="Update"
        cancelText="Cancel"
      />
    </Dialog>
  );
}

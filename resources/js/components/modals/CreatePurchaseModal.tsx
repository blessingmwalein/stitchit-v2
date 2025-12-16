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
  average_cost?: number;
  type?: string;
  description?: string;
}

interface PurchaseOrderLine {
  inventory_item_id: string;
  quantity_ordered: string;
  unit_cost: string;
  cloth_length?: string;
  cloth_width?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  onSuccess?: () => void;
}

export function CreatePurchaseModal({ open, onClose, suppliers, inventoryItems, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const [expectedDate, setExpectedDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    supplier_id: '',
    notes: '',
  });
  const [lines, setLines] = useState<PurchaseOrderLine[]>([
    { inventory_item_id: '', quantity_ordered: '', unit_cost: '', cloth_length: '', cloth_width: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Auto-populate width, unit_cost, and calculate area for cloth items
  React.useEffect(() => {
    const newLines = lines.map(line => {
      const item = inventoryItems.find(i => i.id.toString() === line.inventory_item_id);
      if (!item) return line;

      let updates: Partial<PurchaseOrderLine> = {};

      // Auto-populate unit_cost from average_cost if not set
      if (item.average_cost && !line.unit_cost) {
        updates.unit_cost = item.average_cost.toString();
      }

      // Handle cloth items
      if (['backing_cloth', 'tufting_cloth'].includes(item.type || '')) {
        // Extract width from description based on unit
        const description = item.description || '';
        const unit = item.unit;
        
        // Match different patterns: "100cm × 150cm" or "1m × 1.5m"
        const matchCm = description.match(/(\d+(?:\.\d+)?)cm\s*[×x]\s*(\d+(?:\.\d+)?)cm/);
        const matchM = description.match(/(\d+(?:\.\d+)?)m\s*[×x]\s*(\d+(?:\.\d+)?)m/);
        
        if (unit === 'sqcm' && matchCm && !line.cloth_width) {
          const [, , width] = matchCm;
          updates.cloth_width = width;
        } else if (unit === 'sqm' && matchM && !line.cloth_width) {
          const [, , width] = matchM;
          updates.cloth_width = width;
        }
        
        // Calculate area if we have length and width
        const currentLength = line.cloth_length;
        const currentWidth = updates.cloth_width || line.cloth_width;
        
        if (currentLength && currentWidth) {
          const length = parseFloat(currentLength);
          const width = parseFloat(currentWidth);
          
          if (!isNaN(length) && !isNaN(width) && length > 0 && width > 0) {
            let area = 0;
            let decimalPlaces = 2;
            
            if (unit === 'sqcm') {
              // cm × cm = cm²
              area = length * width;
              decimalPlaces = 2;
            } else if (unit === 'sqm') {
              // m × m = m²
              area = length * width;
              decimalPlaces = 6;
            } else {
              area = length;
              decimalPlaces = 2;
            }
            
            updates.quantity_ordered = area.toFixed(decimalPlaces);
          }
        }
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        return { ...line, ...updates };
      }
      return line;
    });
    
    if (JSON.stringify(newLines) !== JSON.stringify(lines)) {
      setLines(newLines);
    }
  }, [lines, inventoryItems]);

  const handleAddLine = () => {
    setLines([...lines, { inventory_item_id: '', quantity_ordered: '', unit_cost: '', cloth_length: '', cloth_width: '' }]);
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
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        supplier_id: parseInt(formData.supplier_id),
        expected_date: expectedDate ? format(expectedDate, 'yyyy-MM-dd') : null,
        notes: formData.notes || null,
        lines: lines
          .filter((line) => line.inventory_item_id && line.quantity_ordered && line.unit_cost)
          .map((line) => ({
            inventory_item_id: parseInt(line.inventory_item_id),
            quantity_ordered: parseFloat(line.quantity_ordered),
            unit_cost: parseFloat(line.unit_cost),
          })),
      };

      console.log('Submitting purchase order:', payload);

      await axios.post('/admin/purchases', payload);

      dispatch(
        showNotification({
          type: 'success',
          message: 'Purchase order created successfully!',
          duration: 5000,
        })
      );

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      dispatch(
        showNotification({
          type: 'error',
          message: error.response?.data?.message || 'Failed to create purchase order',
          duration: 5000,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setExpectedDate(undefined);
    setFormData({
      supplier_id: '',
      notes: '',
    });
    setLines([{ inventory_item_id: '', quantity_ordered: '', unit_cost: '', cloth_length: '', cloth_width: '' }]);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order to restock inventory from a supplier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 px-1">
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
              date={expectedDate}
              onDateChange={setExpectedDate}
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

                const isClothItem = selectedItem && ['backing_cloth', 'tufting_cloth'].includes((selectedItem as any).type || '');

                return (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-background">
                    <div className="flex-1 space-y-2">
                      {/* Item Selection */}
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

                      {/* Cloth Dimensions (if cloth type) */}
                      {isClothItem && (
                        <div className="grid grid-cols-2 gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Length ({selectedItem.unit === 'sqm' ? 'm' : 'cm'})
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={selectedItem.unit === 'sqm' ? 'e.g., 1.5' : 'e.g., 100'}
                              value={line.cloth_length}
                              onChange={(e) => handleLineChange(index, 'cloth_length', e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Width ({selectedItem.unit === 'sqm' ? 'm' : 'cm'})
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.cloth_width}
                              readOnly
                              className="h-9 bg-gray-100 dark:bg-gray-800"
                              placeholder="Auto-filled"
                            />
                          </div>
                          {line.cloth_length && line.cloth_width && (
                            <div className="col-span-2 text-xs text-blue-700 dark:text-blue-300">
                              📐 Area: {line.quantity_ordered} {selectedItem.unit} ({line.cloth_length}{selectedItem.unit === 'sqm' ? 'm' : 'cm'} × {line.cloth_width}{selectedItem.unit === 'sqm' ? 'm' : 'cm'})
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        {/* Quantity */}
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity {selectedItem && `(${selectedItem.unit})`}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={line.quantity_ordered}
                            onChange={(e) => handleLineChange(index, 'quantity_ordered', e.target.value)}
                            readOnly={isClothItem}
                            className={`h-9 ${isClothItem ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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

                        {/* Subtotal */}
                        <div className="space-y-1">
                          <Label className="text-xs">Subtotal</Label>
                          <div className="h-9 flex items-center font-semibold text-sm">
                            ${lineTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    {lines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 flex-shrink-0"
                        onClick={() => handleRemoveLine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

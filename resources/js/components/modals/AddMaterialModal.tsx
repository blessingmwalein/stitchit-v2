import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: number;
  name: string;
  type: string;
  color?: string;
  unit: string;
  current_stock: number;
  unit_cost: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  jobId: number;
  onSuccess: () => void;
  jobDimensions?: {
    length: number;
    width: number;
  };
}

export function AddMaterialModal({ open, onClose, jobId, onSuccess, jobDimensions }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    inventory_item_id: '',
    consumed_quantity: '',
    waste_quantity: '',
    notes: '',
  });

  const selectedItem = inventoryItems.find(
    (item) => item.id === parseInt(formData.inventory_item_id)
  );

  useEffect(() => {
    if (open) {
      fetchInventoryItems();
      resetForm();
    }
  }, [open]);

  // Auto-calculate cloth quantities based on job dimensions
  useEffect(() => {
    if (!selectedItem || !jobDimensions) return;

    const { type, unit } = selectedItem;
    const { length, width } = jobDimensions;

    // Only calculate for cloth types with job dimensions
    if (!['tufting_cloth', 'backing_cloth'].includes(type)) return;

    let requiredLength = 0;
    let requiredWidth = 0;

    if (type === 'tufting_cloth') {
      // Tufting cloth: add 8cm gap on all sides (16cm total per dimension)
      if (unit === 'sqm') {
        requiredLength = length + 0.16; // 16cm = 0.16m
        requiredWidth = width + 0.16;
      } else if (unit === 'sqcm') {
        requiredLength = length + 16; // 16cm
        requiredWidth = width + 16;
      }
    } else if (type === 'backing_cloth') {
      // Backing cloth: add 5cm waste on all sides (10cm total per dimension)
      if (unit === 'sqm') {
        requiredLength = length + 0.10; // 10cm = 0.10m
        requiredWidth = width + 0.10;
      } else if (unit === 'sqcm') {
        requiredLength = length + 10; // 10cm
        requiredWidth = width + 10;
      }
    }

    if (requiredLength > 0 && requiredWidth > 0) {
      const usedArea = length * width;
      const wasteArea = (requiredLength * requiredWidth) - usedArea;
      
      let decimalPlaces = unit === 'sqm' ? 6 : 2;
      
      setFormData(prev => ({
        ...prev,
        consumed_quantity: usedArea.toFixed(decimalPlaces),
        waste_quantity: wasteArea.toFixed(decimalPlaces),
      }));
    }
  }, [formData.inventory_item_id, jobDimensions]);

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get('/admin/inventory', {
        params: { per_page: 1000 },
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      setInventoryItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      inventory_item_id: '',
      consumed_quantity: '',
      waste_quantity: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`/admin/production/${jobId}/consume`, {
        inventory_item_id: parseInt(formData.inventory_item_id),
        consumed_quantity: parseFloat(formData.consumed_quantity),
        waste_quantity: formData.waste_quantity ? parseFloat(formData.waste_quantity) : 0,
        notes: formData.notes || null,
      });

      toast({
        title: 'Success',
        description: 'Material added successfully',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add material',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Material Usage</DialogTitle>
          <DialogDescription>
            Record actual materials used in production
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Material Selection */}
          <div className="space-y-2">
            <Label htmlFor="material">Material *</Label>
            <Select
              value={formData.inventory_item_id}
              onValueChange={(value) =>
                setFormData({ ...formData, inventory_item_id: value })
              }
            >
              <SelectTrigger id="material">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5} className="max-h-[300px] z-[10001]">
                {inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {item.name}
                        {item.color && (
                          <span className="text-muted-foreground"> ({item.color})</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {item.current_stock} {item.unit} available
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItem && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div>
                <p className="text-muted-foreground">Unit</p>
                <p className="font-medium">{selectedItem.unit}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Stock Available</p>
                <p className="font-medium">
                  {selectedItem.current_stock} {selectedItem.unit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Unit Cost</p>
                <p className="font-medium">${selectedItem.unit_cost}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">
                  {selectedItem.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}

          {/* Job Dimensions Info for Cloth */}
          {selectedItem && jobDimensions && ['tufting_cloth', 'backing_cloth'].includes(selectedItem.type) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Auto-calculated from Job Dimensions</h4>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p>Job Size: {jobDimensions.length}{selectedItem.unit === 'sqm' ? 'm' : 'cm'} × {jobDimensions.width}{selectedItem.unit === 'sqm' ? 'm' : 'cm'}</p>
                {selectedItem.type === 'tufting_cloth' && (
                  <p>• Tufting Cloth: +8cm gap on all sides (for frame tensioning)</p>
                )}
                {selectedItem.type === 'backing_cloth' && (
                  <p>• Backing Cloth: +5cm allowance on all sides</p>
                )}
              </div>
            </div>
          )}

          {/* Quantity Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consumed_quantity">
                Used Quantity *
                {selectedItem && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({selectedItem.unit})
                  </span>
                )}
              </Label>
              <Input
                id="consumed_quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.consumed_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, consumed_quantity: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waste_quantity">
                Waste Quantity
                {selectedItem && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({selectedItem.unit})
                  </span>
                )}
              </Label>
              <Input
                id="waste_quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.waste_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, waste_quantity: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total Calculation */}
          {selectedItem && formData.consumed_quantity && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Quantity</span>
                <span className="font-medium">
                  {(
                    parseFloat(formData.consumed_quantity) +
                    (formData.waste_quantity ? parseFloat(formData.waste_quantity) : 0)
                  ).toFixed(2)}{' '}
                  {selectedItem.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Estimated Cost</span>
                <span className="text-blue-600">
                  $
                  {(
                    (parseFloat(formData.consumed_quantity) +
                      (formData.waste_quantity ? parseFloat(formData.waste_quantity) : 0)) *
                    selectedItem.unit_cost
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this material usage..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { adjustStock } from '@/store/slices/inventorySlice';
import { Plus, Minus } from 'lucide-react';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  current_stock: number;
  unit: string;
  type?: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSuccess?: () => void;
}

export function StockAdjustmentModal({ open, onClose, item, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('MANUAL_ADJUSTMENT');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // State for cloth dimensions
  const [clothDimensions, setClothDimensions] = useState({
    length: '',
    width: '',
  });

  // Check if current item is cloth that needs dimensions
  const isClothType = item && ['backing_cloth', 'tufting_cloth'].includes(item.type || '');

  // Auto-populate width from description when item changes
  React.useEffect(() => {
    if (item?.description && isClothType) {
      // Extract dimensions from description format: "100cm × 150cm"
      const match = item.description.match(/(\d+(?:\.\d+)?)cm\s*[×x]\s*(\d+(?:\.\d+)?)cm/);
      if (match) {
        const [, length, width] = match;
        setClothDimensions({ length: '', width: width || '' });
      }
    } else if (!isClothType) {
      setClothDimensions({ length: '', width: '' });
    }
  }, [item, isClothType]);

  // Calculate area when dimensions change
  React.useEffect(() => {
    if (isClothType && clothDimensions.length && clothDimensions.width && item) {
      const length = parseFloat(clothDimensions.length);
      const width = parseFloat(clothDimensions.width);
      
      if (!isNaN(length) && !isNaN(width) && length > 0 && width > 0) {
        let area = 0;
        const unit = item.unit;
        
        // Calculate based on unit
        if (unit === 'sqcm') {
          area = length * width; // cm × cm = cm²
        } else if (unit === 'sqm') {
          area = (length * width) / 10000; // cm × cm / 10000 = m²
        } else {
          // For other units, just use length
          area = length;
        }
        
        setQuantity(area.toFixed(2));
      }
    }
  }, [clothDimensions.length, clothDimensions.width, item, isClothType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const quantityValue = parseFloat(quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      dispatch(showNotification({
        type: 'error',
        message: 'Please enter a valid quantity',
      }));
      return;
    }

    setLoading(true);
    try {
      const quantityChange = adjustmentType === 'add' ? quantityValue : -quantityValue;
      
      await dispatch(adjustStock({
        id: item.id,
        quantity_change: quantityChange,
        reason,
        notes: notes || undefined,
      })).unwrap();

      dispatch(showNotification({
        type: 'success',
        message: `Stock adjusted successfully for ${item.name}`,
      }));

      onSuccess?.();
      handleClose();
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to adjust stock',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setReason('MANUAL_ADJUSTMENT');
    setNotes('');
    setAdjustmentType('add');
    setClothDimensions({ length: '', width: '' });
    onClose();
  };

  if (!item) return null;

  const currentStock = parseFloat(item.current_stock.toString());
  const quantityValue = parseFloat(quantity) || 0;
  const newStock = adjustmentType === 'add' 
    ? currentStock + quantityValue
    : currentStock - quantityValue;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Adjust Stock - {item.name}</DialogTitle>
          <DialogDescription>
            Current Stock: <span className="font-mono font-semibold">{currentStock} {item.unit}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1">
          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  adjustmentType === 'add'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('remove')}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  adjustmentType === 'remove'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Minus className="h-5 w-5" />
                <span className="font-medium">Remove Stock</span>
              </button>
            </div>
          </div>

          {/* Cloth Dimensions Helper - Show for backing_cloth and tufting_cloth */}
          {isClothType && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Enter Cloth Dimensions</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Enter the length and width to automatically calculate the area
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cloth_length">Length (cm)</Label>
                  <Input
                    id="cloth_length"
                    type="number"
                    step="0.01"
                    value={clothDimensions.length}
                    onChange={(e) => setClothDimensions(prev => ({ ...prev, length: e.target.value }))}
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cloth_width">Width (cm)</Label>
                  <Input
                    id="cloth_width"
                    type="number"
                    step="0.01"
                    value={clothDimensions.width}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-800"
                    placeholder="Auto-filled from item"
                  />
                  <p className="text-xs text-muted-foreground">Width is based on the cloth SKU selected</p>
                </div>
              </div>
              {clothDimensions.length && clothDimensions.width && (
                <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-blue-300">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Calculated Area: <span className="text-lg">{quantity}</span> {item.unit}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Dimensions: {clothDimensions.length}cm × {clothDimensions.width}cm
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity {isClothType ? '(Auto-calculated from dimensions)' : ''} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={isClothType ? "Enter dimensions above" : "Enter quantity"}
                required
                readOnly={isClothType}
                className={`pr-16 ${isClothType ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {item.unit}
              </span>
            </div>
            {quantity && !isNaN(parseFloat(quantity)) && (
              <p className="text-sm text-muted-foreground">
                New stock will be: <span className={`font-semibold ${newStock < 0 ? 'text-red-600' : ''}`}>
                  {newStock.toFixed(2)} {item.unit}
                </span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={setReason}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                <SelectItem value="MANUAL_ADJUSTMENT">Manual Adjustment</SelectItem>
                <SelectItem value="DAMAGE">Damage / Loss</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
                <SelectItem value="CORRECTION">Inventory Correction</SelectItem>
                <SelectItem value="FOUND">Found / Discovery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this adjustment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary Box */}
          <div className={`p-4 rounded-lg border-2 ${
            adjustmentType === 'add' 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Current Stock:</span>
              <span className="font-mono">{currentStock.toFixed(2)} {item.unit}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-medium">Adjustment:</span>
              <span className={`font-mono font-semibold ${
                adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'
              }`}>
                {adjustmentType === 'add' ? '+' : '-'}{quantity || '0'} {item.unit}
              </span>
            </div>
            <div className="border-t mt-2 pt-2 flex items-center justify-between">
              <span className="font-semibold">New Stock:</span>
              <span className={`font-mono font-bold text-lg ${newStock < 0 ? 'text-red-600' : ''}`}>
                {newStock.toFixed(2)} {item.unit}
              </span>
            </div>
          </div>

          {newStock < 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Warning: This adjustment will result in negative stock
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 flex-shrink-0 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !quantity}>
              {loading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

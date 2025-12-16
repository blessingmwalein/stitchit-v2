import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description?: string;
  type: string;
  unit: string;
  current_stock: number;
  average_cost?: number;
  unit_cost?: number;
  reorder_point: number;
}

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
  inventoryItem?: InventoryItem | null;
  onSuccess?: () => void;
}

export function InventoryModal({ open, onClose, inventoryItem, onSuccess }: InventoryModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    type: 'yarn',
    unit: 'meter',
    current_stock: '0',
    average_cost: '',
    reorder_point: '',
  });

  // State for cloth dimensions
  const [clothDimensions, setClothDimensions] = useState({
    length: '',
    width: '',
  });

  // Check if current type is cloth that needs dimensions
  const isClothType = ['backing_cloth', 'tufting_cloth'].includes(formData.type);

  // Calculate area when dimensions change
  useEffect(() => {
    if (isClothType && clothDimensions.length && clothDimensions.width) {
      const length = parseFloat(clothDimensions.length);
      const width = parseFloat(clothDimensions.width);
      
      if (!isNaN(length) && !isNaN(width) && length > 0 && width > 0) {
        let area = 0;
        let unit = formData.unit;
        let decimalPlaces = 2;
        
        // Calculate based on selected unit
        if (unit === 'sqcm') {
          // Input in cm, output in cm²
          area = length * width; // cm × cm = cm²
          decimalPlaces = 2;
          setFormData(prev => ({
            ...prev,
            current_stock: area.toFixed(decimalPlaces),
            description: `${length}cm × ${width}cm`
          }));
        } else if (unit === 'sqm') {
          // Input in m, output in m²
          area = length * width; // m × m = m²
          decimalPlaces = 6;
          setFormData(prev => ({
            ...prev,
            current_stock: area.toFixed(decimalPlaces),
            description: `${length}m × ${width}m`
          }));
        } else {
          // For other units, just use length
          area = length;
          decimalPlaces = 2;
          setFormData(prev => ({
            ...prev,
            current_stock: area.toFixed(decimalPlaces),
            description: `${length}cm × ${width}cm`
          }));
        }
      }
    }
  }, [clothDimensions.length, clothDimensions.width, formData.unit, isClothType]);

  useEffect(() => {
    if (inventoryItem) {
      const cost = inventoryItem.average_cost || inventoryItem.unit_cost || 0;
      setFormData({
        sku: inventoryItem.sku,
        name: inventoryItem.name,
        description: inventoryItem.description || '',
        type: inventoryItem.type,
        unit: inventoryItem.unit,
        current_stock: inventoryItem.current_stock.toString(),
        average_cost: cost.toString(),
        reorder_point: inventoryItem.reorder_point.toString(),
      });
      
      // Reset cloth dimensions when editing
      setClothDimensions({ length: '', width: '' });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        type: 'yarn',
        unit: 'meter',
        current_stock: '0',
        average_cost: '',
        reorder_point: '',
      });
      setClothDimensions({ length: '', width: '' });
    }
    setErrors({});
  }, [inventoryItem, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const averageCost = parseFloat(formData.average_cost);
    if (!formData.average_cost || isNaN(averageCost) || averageCost < 0) {
      newErrors.average_cost = 'Valid unit price is required';
    }

    const reorderPoint = parseFloat(formData.reorder_point);
    if (!formData.reorder_point || isNaN(reorderPoint) || reorderPoint < 0) {
      newErrors.reorder_point = 'Valid reorder point is required';
    }

    const currentStock = parseFloat(formData.current_stock);
    if (isNaN(currentStock) || currentStock < 0) {
      newErrors.current_stock = 'Valid quantity is required';
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
      const payload = {
        ...formData,
        current_stock: parseFloat(formData.current_stock),
        average_cost: parseFloat(formData.average_cost),
        reorder_point: parseFloat(formData.reorder_point),
      };

      if (inventoryItem) {
        await axios.put(`/admin/inventory/${inventoryItem.id}`, payload);
        dispatch(showNotification({
          type: 'success',
          message: 'Inventory item updated successfully',
        }));
      } else {
        await axios.post('/admin/inventory', payload);
        dispatch(showNotification({
          type: 'success',
          message: 'Inventory item created successfully',
        }));
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save inventory item';
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inventoryItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., YARN-001"
                  required
                />
                {errors.sku && (
                  <p className="text-sm text-red-600">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Wool Yarn"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the material"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Material Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                    <SelectItem value="yarn">Yarn</SelectItem>
                    <SelectItem value="tufting_cloth">Tufting Cloth</SelectItem>
                    <SelectItem value="backing_cloth">Backing Cloth</SelectItem>
                    <SelectItem value="carpet_tile_vinyl">Carpet Tile Vinyl</SelectItem>
                    <SelectItem value="backing_glue">Backing Glue</SelectItem>
                    <SelectItem value="glue_stick">Glue Stick</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="meter">Meters (meter)</SelectItem>
                    <SelectItem value="sqcm">Square Centimeters (cm²)</SelectItem>
                    <SelectItem value="sqm">Square Meters (m²)</SelectItem>
                    <SelectItem value="piece">Pieces (piece)</SelectItem>
                    <SelectItem value="roll">Rolls (roll)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-sm text-red-600">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* Cloth Dimensions Helper - Show for backing_cloth and tufting_cloth */}
            {isClothType && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Cloth Area Calculator</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Enter the length and width of the cloth to automatically calculate the area
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cloth_length">
                      Length ({formData.unit === 'sqm' ? 'm' : 'cm'})
                    </Label>
                    <Input
                      id="cloth_length"
                      type="number"
                      step="0.01"
                      value={clothDimensions.length}
                      onChange={(e) => setClothDimensions(prev => ({ ...prev, length: e.target.value }))}
                      placeholder={formData.unit === 'sqm' ? 'e.g., 1.5' : 'e.g., 100'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloth_width">
                      Width ({formData.unit === 'sqm' ? 'm' : 'cm'})
                    </Label>
                    <Input
                      id="cloth_width"
                      type="number"
                      step="0.01"
                      value={clothDimensions.width}
                      onChange={(e) => setClothDimensions(prev => ({ ...prev, width: e.target.value }))}
                      placeholder={formData.unit === 'sqm' ? 'e.g., 2.0' : 'e.g., 150'}
                    />
                  </div>
                </div>
                {clothDimensions.length && clothDimensions.width && (
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-blue-300">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Calculated Area: <span className="text-lg font-bold">{formData.current_stock}</span> {formData.unit}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Dimensions: {clothDimensions.length}{formData.unit === 'sqm' ? 'm' : 'cm'} × {clothDimensions.width}{formData.unit === 'sqm' ? 'm' : 'cm'}
                    </p>
                    {formData.unit === 'sqm' && (
                      <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                        = {(parseFloat(clothDimensions.length) * parseFloat(clothDimensions.width) * 10000).toFixed(2)} cm²
                      </p>
                    )}
                    {formData.unit === 'sqcm' && parseFloat(formData.current_stock) >= 10000 && (
                      <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                        = {(parseFloat(formData.current_stock) / 10000).toFixed(4)} m²
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_stock">
                  Current Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="current_stock"
                  name="current_stock"
                  type="number"
                  step="0.01"
                  value={formData.current_stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
                {errors.current_stock && (
                  <p className="text-sm text-red-600">{errors.current_stock}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="average_cost">
                  Unit Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="average_cost"
                  name="average_cost"
                  type="number"
                  step="0.01"
                  value={formData.average_cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
                {errors.average_cost && (
                  <p className="text-sm text-red-600">{errors.average_cost}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder_point">
                  Reorder Point <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reorder_point"
                  name="reorder_point"
                  type="number"
                  step="0.01"
                  value={formData.reorder_point}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
                {errors.reorder_point && (
                  <p className="text-sm text-red-600">{errors.reorder_point}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#FF8A50] hover:bg-[#FF9B71]">
              {loading ? 'Saving...' : inventoryItem ? 'Update Item' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

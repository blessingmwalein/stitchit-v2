import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { Badge } from '@/components/ui/badge';

interface InventoryItem {
  id: number;
  name: string;
  type: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
}

interface RecipeItem {
  inventory_item_id: number | null;
  calculation_type: 'per_sqcm' | 'per_rug' | 'fixed_amount';
  quantity: number;
  unit: string;
  notes: string;
}

interface Props {
  inventoryItems: InventoryItem[];
}

export default function RugPricingCreate({ inventoryItems }: Props) {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reference_width_cm: 70,
    reference_height_cm: 70,
    reference_price: 50,
    min_price: 45,
    max_price: 55,
    profit_margin_percentage: 20,
    is_active: true,
  });

  const [items, setItems] = useState<RecipeItem[]>([]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        inventory_item_id: null,
        calculation_type: 'per_sqcm',
        quantity: 0,
        unit: '',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RecipeItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      dispatch(showNotification({
        type: 'error',
        message: 'Recipe name is required',
      }));
      return;
    }

    if (items.length === 0) {
      dispatch(showNotification({
        type: 'error',
        message: 'Add at least one material to the recipe',
      }));
      return;
    }

    const invalidItems = items.filter(item => !item.inventory_item_id || item.quantity <= 0);
    if (invalidItems.length > 0) {
      dispatch(showNotification({
        type: 'error',
        message: 'All items must have a material selected and valid quantity',
      }));
      return;
    }

    setSubmitting(true);

    router.post('/admin/rug-pricing', {
      ...formData,
      items,
    }, {
      onSuccess: () => {
        dispatch(showNotification({
          type: 'success',
          message: 'Pricing recipe created successfully',
        }));
      },
      onError: (errors) => {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to create recipe. Please check the form.',
        }));
        console.error('Validation errors:', errors);
      },
      onFinish: () => setSubmitting(false),
    });
  };

  const getInventoryItem = (id: number) => {
    return inventoryItems.find(item => item.id === id);
  };

  return (
    <AppLayout>
      <Head title="Create Pricing Recipe" />
      
      <div className="flex h-full flex-1 flex-col gap-8 bg-gradient-to-br from-[#F4F4F1] via-[#ECECE9] to-[#E8E8E5] p-8 lg:p-12">
        {/* Header Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/60 bg-gradient-to-br from-[#2A2A2E] via-[#3A3A42] to-[#2A2A2E] p-10">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5C563]"></span>
                New Recipe
              </div>
              <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white">
                Create Pricing Recipe
              </h1>
              <p className="mt-3 text-base font-medium text-white/70">
                Define materials and costs for rug production
              </p>
            </div>
            <Button
              className="rounded-xl"
              variant="outline"
              onClick={() => router.get('/admin/rug-pricing')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#F5C563]/20 blur-[100px]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-2xl border-gray-200/60">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General details about this pricing recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    className="rounded-xl"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard Rug Recipe"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    className="rounded-xl"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this recipe"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active Recipe</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-200/60">
            <CardHeader>
              <CardTitle>Reference Data (70×70cm Example)</CardTitle>
              <CardDescription>
                Use this to calibrate the pricing formula based on known costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_width_cm">Width (cm)</Label>
                  <Input
                    id="reference_width_cm"
                    type="number"
                    step="0.01"
                    value={formData.reference_width_cm}
                    onChange={(e) => setFormData({ ...formData, reference_width_cm: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="reference_height_cm">Height (cm)</Label>
                  <Input
                    id="reference_height_cm"
                    type="number"
                    step="0.01"
                    value={formData.reference_height_cm}
                    onChange={(e) => setFormData({ ...formData, reference_height_cm: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="reference_price">Reference Price ($)</Label>
                  <Input
                    id="reference_price"
                    type="number"
                    step="0.01"
                    value={formData.reference_price}
                    onChange={(e) => setFormData({ ...formData, reference_price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="profit_margin_percentage">Profit Margin (%)</Label>
                  <Input
                    id="profit_margin_percentage"
                    type="number"
                    step="0.01"
                    value={formData.profit_margin_percentage}
                    onChange={(e) => setFormData({ ...formData, profit_margin_percentage: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="min_price">Min Price ($)</Label>
                  <Input
                    id="min_price"
                    type="number"
                    step="0.01"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="max_price">Max Price ($)</Label>
                  <Input
                    id="max_price"
                    type="number"
                    step="0.01"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-200/60">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recipe Materials</CardTitle>
                  <CardDescription>Select materials and define how they're calculated</CardDescription>
                </div>
                <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No materials added yet. Click "Add Material" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const selectedItem = item.inventory_item_id ? getInventoryItem(item.inventory_item_id) : null;
                    
                    return (
                      <Card key={index} className="rounded-xl border-2">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                              <Label>Material *</Label>
                              <Select
                                value={item.inventory_item_id?.toString() || ''}
                                onValueChange={(value) => handleItemChange(index, 'inventory_item_id', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                  {inventoryItems.map((invItem) => (
                                    <SelectItem key={invItem.id} value={invItem.id.toString()}>
                                      {invItem.name} - ${invItem.unit_cost}/{invItem.unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedItem && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Unit cost: ${selectedItem.unit_cost} / {selectedItem.unit}
                                </div>
                              )}
                            </div>

                            <div className="col-span-3">
                              <Label>Calculation Type *</Label>
                              <Select
                                value={item.calculation_type}
                                onValueChange={(value: any) => handleItemChange(index, 'calculation_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="per_sqcm">Per Sq.Cm (scales with area)</SelectItem>
                                  <SelectItem value="per_rug">Per Rug (fixed quantity)</SelectItem>
                                  <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                                </SelectContent>
                              </Select>
                              {item.calculation_type === 'per_sqcm' && (
                                <p className="mt-1 text-xs text-blue-600">
                                  Enter TOTAL quantity needed for the reference rug size. Will scale proportionally for other sizes.
                                </p>
                              )}
                              {item.calculation_type === 'per_rug' && (
                                <p className="mt-1 text-xs text-blue-600">
                                  Enter total quantity needed per rug (doesn't scale with size).
                                </p>
                              )}
                              {item.calculation_type === 'fixed_amount' && (
                                <p className="mt-1 text-xs text-blue-600">
                                  Enter a fixed dollar amount.
                                </p>
                              )}
                            </div>

                            <div className="col-span-2">
                              <Label>Quantity *</Label>
                              <Input
                                className="rounded-xl"
                                type="number"
                                step="0.0001"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                              {item.calculation_type === 'per_sqcm' && selectedItem && formData.reference_width_cm && formData.reference_height_cm && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  For {formData.reference_width_cm}×{formData.reference_height_cm}cm reference: ${(item.quantity * (selectedItem.unit_cost || 0)).toFixed(8)}
                                </p>
                              )}
                            </div>

                            <div className="col-span-2">
                              <Label>Unit</Label>
                              <Input
                                className="rounded-xl"
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                placeholder={selectedItem?.unit || 'unit'}
                              />
                            </div>

                            <div className="col-span-1 flex items-end">
                              <Button
                                className="rounded-xl"
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="col-span-12">
                              <Label>Notes</Label>
                              <Input
                                className="rounded-xl"
                                value={item.notes}
                                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                placeholder="Additional notes about this material"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              className="rounded-xl"
              type="button"
              variant="outline"
              onClick={() => router.get('/admin/rug-pricing')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Creating...' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

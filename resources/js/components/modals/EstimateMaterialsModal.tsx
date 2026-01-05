import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calculator, Palette } from 'lucide-react';
import axios from 'axios';

interface Recipe {
  id: number;
  name: string;
  description: string;
  profit_margin_percentage: number;
}

interface InventoryItem {
  id: number;
  name: string;
  color?: string;
  unit: string;
  unit_cost: number;
  category?: string;
}

interface CalculatedMaterial {
  inventory_item_id: number;
  inventory_item: InventoryItem;
  calculation_type: string;
  quantity: number;
  total_quantity: number; // For display (e.g., 1000g)
  unit: string;
  unit_cost: number;
  total_cost: number;
  // For yarn allocation
  balls_needed?: number;
  grams_per_ball?: number;
  color_allocations?: Array<{
    inventory_item_id: number;
    color: string;
    balls: number;
    grams: number;
  }>;
}

interface EstimateMaterialsModalProps {
  open: boolean;
  onClose: () => void;
  jobId: number;
  jobDimensions: {
    width: number;
    height: number;
  };
  onSuccess: () => void;
}

export function EstimateMaterialsModal({
  open,
  onClose,
  jobId,
  jobDimensions,
  onSuccess,
}: EstimateMaterialsModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [calculatedMaterials, setCalculatedMaterials] = useState<CalculatedMaterial[]>([]);
  const [yarnColors, setYarnColors] = useState<InventoryItem[]>([]);
  const [estimatedLaborHours, setEstimatedLaborHours] = useState<number>(8);

  useEffect(() => {
    if (open) {
      fetchRecipes();
      fetchYarnColors();
    } else {
      resetForm();
    }
  }, [open]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('/admin/rug-pricing/recipes');
      const activeRecipes = response.data.data?.filter((r: Recipe) => r.is_active) || [];
      setRecipes(activeRecipes);
      
      // Auto-select first active recipe
      if (activeRecipes.length > 0) {
        setSelectedRecipeId(activeRecipes[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipes',
        variant: 'destructive',
      });
    }
  };

  const fetchYarnColors = async () => {
    try {
      const response = await axios.get('/admin/inventory', {
        params: { category: 'yarn' }
      });
      setYarnColors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch yarn colors:', error);
    }
  };

  const handleCalculate = async () => {
    if (!selectedRecipeId) {
      toast({
        title: 'Error',
        description: 'Please select a recipe',
        variant: 'destructive',
      });
      return;
    }

    setCalculating(true);
    try {
      const response = await axios.post('/admin/production/estimate-materials', {
        recipe_id: selectedRecipeId,
        width_cm: jobDimensions.width,
        height_cm: jobDimensions.height,
      });

      if (response.data.success) {
        const materials = response.data.data.materials.map((material: any) => {
          // For yarn, calculate balls needed
          if (material.inventory_item.category === 'yarn' && material.inventory_item.unit === 'grams') {
            const gramsPerBall = 100; // Standard ball weight
            const totalGrams = material.total_quantity;
            const ballsNeeded = Math.ceil(totalGrams / gramsPerBall);
            
            return {
              ...material,
              balls_needed: ballsNeeded,
              grams_per_ball: gramsPerBall,
              color_allocations: [{
                inventory_item_id: material.inventory_item_id,
                color: material.inventory_item.color || 'Default',
                balls: ballsNeeded,
                grams: totalGrams,
              }],
            };
          }
          return material;
        });

        setCalculatedMaterials(materials);
        
        toast({
          title: 'Success',
          description: `Calculated materials for ${response.data.data.area_sqcm} cm²`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to calculate materials',
        variant: 'destructive',
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleColorAllocationChange = (materialIndex: number, allocationIndex: number, field: string, value: any) => {
    setCalculatedMaterials(prev => {
      const updated = [...prev];
      const material = { ...updated[materialIndex] };
      
      if (material.color_allocations) {
        material.color_allocations = [...material.color_allocations];
        material.color_allocations[allocationIndex] = {
          ...material.color_allocations[allocationIndex],
          [field]: value,
        };
        
        // Recalculate grams based on balls
        if (field === 'balls') {
          material.color_allocations[allocationIndex].grams = value * (material.grams_per_ball || 100);
        }
      }
      
      updated[materialIndex] = material;
      return updated;
    });
  };

  const addColorAllocation = (materialIndex: number) => {
    setCalculatedMaterials(prev => {
      const updated = [...prev];
      const material = { ...updated[materialIndex] };
      
      if (!material.color_allocations) {
        material.color_allocations = [];
      } else {
        material.color_allocations = [...material.color_allocations];
      }
      
      material.color_allocations.push({
        inventory_item_id: 0,
        color: '',
        balls: 0,
        grams: 0,
      });
      
      updated[materialIndex] = material;
      return updated;
    });
  };

  const removeColorAllocation = (materialIndex: number, allocationIndex: number) => {
    setCalculatedMaterials(prev => {
      const updated = [...prev];
      const material = { ...updated[materialIndex] };
      
      if (material.color_allocations) {
        material.color_allocations = material.color_allocations.filter((_, i) => i !== allocationIndex);
      }
      
      updated[materialIndex] = material;
      return updated;
    });
  };

  const getTotalAllocatedBalls = (material: CalculatedMaterial) => {
    return material.color_allocations?.reduce((sum, alloc) => sum + (alloc.balls || 0), 0) || 0;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare materials data
      const materialsToSave = calculatedMaterials.flatMap(material => {
        // For yarn with color allocations, create separate entries per color
        if (material.color_allocations && material.color_allocations.length > 0) {
          return material.color_allocations
            .filter(alloc => alloc.inventory_item_id > 0 && alloc.balls > 0)
            .map(alloc => ({
              inventory_item_id: alloc.inventory_item_id,
              type: 'estimated',
              consumed_quantity: alloc.grams,
              waste_quantity: 0,
            }));
        }
        
        // For other materials, save as-is
        return [{
          inventory_item_id: material.inventory_item_id,
          type: 'estimated',
          consumed_quantity: material.total_quantity,
          waste_quantity: 0,
        }];
      });

      await axios.post(`/admin/production/${jobId}/estimate`, {
        materials: materialsToSave,
        estimated_labor_hours: estimatedLaborHours,
      });

      toast({
        title: 'Success',
        description: 'Materials estimated successfully',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save estimates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRecipeId(null);
    setCalculatedMaterials([]);
    setEstimatedLaborHours(8);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Estimate Materials from Recipe
          </DialogTitle>
          <DialogDescription>
            Calculate material requirements based on recipe and job dimensions ({jobDimensions.width} × {jobDimensions.height} cm)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipe Selection */}
          <div className="space-y-2">
            <Label>Select Recipe</Label>
            <div className="flex gap-2">
              <Select
                value={selectedRecipeId?.toString() || ''}
                onValueChange={(value) => setSelectedRecipeId(Number(value))}
              >
                <SelectTrigger className="flex-1 rounded-xl">
                  <SelectValue placeholder="Choose a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleCalculate}
                disabled={!selectedRecipeId || calculating}
                className="gap-2"
              >
                {calculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Calculate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Estimated Labor Hours */}
          <div className="space-y-2">
            <Label>Estimated Labor Hours</Label>
            <Input
              type="number"
              step="0.5"
              value={estimatedLaborHours}
              onChange={(e) => setEstimatedLaborHours(Number(e.target.value))}
              className="rounded-xl"
            />
          </div>

          {/* Calculated Materials */}
          {calculatedMaterials.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Calculated Materials</h3>
                <Badge variant="outline">
                  {calculatedMaterials.length} items
                </Badge>
              </div>

              {calculatedMaterials.map((material, materialIndex) => (
                <div key={materialIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{material.inventory_item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.total_quantity.toFixed(2)} {material.unit} • 
                        ${material.total_cost.toFixed(2)}
                      </p>
                    </div>
                    {material.balls_needed && (
                      <Badge variant="secondary">
                        {material.balls_needed} balls needed
                      </Badge>
                    )}
                  </div>

                  {/* Yarn Color Allocations */}
                  {material.color_allocations && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Color Allocations
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addColorAllocation(materialIndex)}
                        >
                          + Add Color
                        </Button>
                      </div>

                      {material.color_allocations.map((allocation, allocIndex) => (
                        <div key={allocIndex} className="grid grid-cols-3 gap-3 items-end p-3 bg-muted/50 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-xs">Color/Variant</Label>
                            <Select
                              value={allocation.inventory_item_id.toString()}
                              onValueChange={(value) =>
                                handleColorAllocationChange(materialIndex, allocIndex, 'inventory_item_id', Number(value))
                              }
                            >
                              <SelectTrigger className="h-9 rounded-xl">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                {yarnColors.map((yarn) => (
                                  <SelectItem key={yarn.id} value={yarn.id.toString()}>
                                    {yarn.name} {yarn.color && `- ${yarn.color}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Balls</Label>
                            <Input
                              type="number"
                              min="0"
                              value={allocation.balls}
                              onChange={(e) =>
                                handleColorAllocationChange(materialIndex, allocIndex, 'balls', Number(e.target.value))
                              }
                              className="h-9 rounded-xl"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                {allocation.grams}g
                              </p>
                            </div>
                            {material.color_allocations && material.color_allocations.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeColorAllocation(materialIndex, allocIndex)}
                                className="text-destructive"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {material.balls_needed && (
                        <div className="text-sm">
                          <span className={getTotalAllocatedBalls(material) === material.balls_needed ? 'text-green-600' : 'text-orange-600'}>
                            Allocated: {getTotalAllocatedBalls(material)} / {material.balls_needed} balls
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Total Estimated Cost */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Estimated Material Cost</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculatedMaterials.reduce((sum, m) => sum + m.total_cost, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || calculatedMaterials.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Estimates'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

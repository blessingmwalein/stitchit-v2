import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface Recipe {
  id: number;
  name: string;
  description: string;
  profit_margin_percentage: number;
}

interface ItemCost {
  item_name: string;
  calculation_type: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface CalculationResult {
  recipe_name: string;
  width_cm: number;
  height_cm: number;
  area_sqcm: number;
  total_material_cost: number;
  cost_per_sqcm: number;
  profit_margin_percentage: number;
  profit_amount: number;
  final_price: number;
  item_costs: ItemCost[];
}

interface Props {
  recipes: Recipe[];
}

export default function RugPricingCalculator({ recipes }: Props) {
  const dispatch = useAppDispatch();
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(
    recipes.length > 0 ? recipes[0].id : null
  );
  const [widthCm, setWidthCm] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(70);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = async () => {
    if (!selectedRecipeId) {
      dispatch(showNotification({
        type: 'error',
        message: 'Please select a pricing recipe',
      }));
      return;
    }

    if (widthCm <= 0 || heightCm <= 0) {
      dispatch(showNotification({
        type: 'error',
        message: 'Please enter valid dimensions',
      }));
      return;
    }

    setCalculating(true);

    try {
      const response = await axios.post('/admin/rug-pricing/calculate', {
        recipe_id: selectedRecipeId,
        width_cm: widthCm,
        height_cm: heightCm,
        profit_margin_percentage: profitMargin,
      });

      if (response.data.success) {
        setResult(response.data.data);
        dispatch(showNotification({
          type: 'success',
          message: 'Price calculated successfully',
        }));
      }
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to calculate price',
      }));
    } finally {
      setCalculating(false);
    }
  };

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  return (
    <AppLayout>
      <Head title="Rug Price Calculator" />
      
      <div className="flex h-full flex-1 flex-col gap-8 bg-gradient-to-br from-[#F4F4F1] via-[#ECECE9] to-[#E8E8E5] p-8 lg:p-12">
        {/* Header Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/60 bg-gradient-to-br from-[#2A2A2E] via-[#3A3A42] to-[#2A2A2E] p-10">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5C563]"></span>
              Price Calculator
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white">
              Rug Price Calculator
            </h1>
            <p className="mt-3 text-base font-medium text-white/70">
              Calculate production costs and pricing for custom rug dimensions
            </p>
          </div>
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#F5C563]/20 blur-[100px]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-gray-200/60">
            <CardHeader>
              <CardTitle>Rug Specifications</CardTitle>
              <CardDescription>Enter the rug dimensions and select a pricing recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipe">Pricing Recipe</Label>
                <Select
                  value={selectedRecipeId?.toString() || ''}
                  onValueChange={(value) => setSelectedRecipeId(parseInt(value))}
                >
                  <SelectTrigger id="recipe" className="rounded-xl">
                    <SelectValue placeholder="Select recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id.toString()}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRecipe?.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedRecipe.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    className="rounded-xl"
                    id="width"
                    type="number"
                    step="0.1"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseFloat(e.target.value) || 0)}
                    placeholder="70"
                  />
                </div>

                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    placeholder="70"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profit">Profit Margin (%)</Label>
                <Input
                  id="profit"
                  type="number"
                  step="0.1"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  placeholder="20"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Override the default profit margin from the recipe
                </p>
              </div>

              <div className="pt-2">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Area</div>
                  <div className="text-2xl font-bold">
                    {(widthCm * heightCm).toLocaleString()} cm²
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((widthCm * heightCm) / 10000).toFixed(2)} m²
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCalculate}
                disabled={calculating || !selectedRecipeId}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {calculating ? 'Calculating...' : 'Calculate Price'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Result</CardTitle>
              <CardDescription>
                {result ? 'Calculated costs and final price' : 'Enter specifications and calculate'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-medium">
                        {result.width_cm} × {result.height_cm} cm
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Area</span>
                      <span className="font-medium">{result.area_sqcm.toLocaleString()} cm²</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Cost Breakdown</h4>
                    <div className="space-y-1.5">
                      {result.item_costs.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.item_name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.calculation_type}
                            </Badge>
                          </span>
                          <span className="font-medium">${item.total_cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Material Cost</span>
                      <span className="font-medium">${result.total_material_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost per cm²</span>
                      <span className="font-medium">${result.cost_per_sqcm.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Profit ({result.profit_margin_percentage}%)
                      </span>
                      <span className="font-medium text-green-600">
                        +${result.profit_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Final Price</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          ${result.final_price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${(result.final_price / result.area_sqcm).toFixed(4)} per cm²
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No calculation yet. Fill in the specifications and click Calculate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

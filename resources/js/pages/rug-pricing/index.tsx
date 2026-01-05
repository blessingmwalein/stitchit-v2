import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { Edit, Trash2, DollarSign, Calculator, Eye } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecipeItem {
  id: number;
  inventory_item_id: number;
  calculation_type: string;
  quantity: number;
  unit: string;
  notes: string;
  inventory_item: {
    id: number;
    name: string;
    unit_cost: number;
  };
}

interface Recipe {
  id: number;
  name: string;
  description: string;
  reference_width_cm: number;
  reference_height_cm: number;
  reference_price: number;
  min_price: number;
  max_price: number;
  profit_margin_percentage: number;
  is_active: boolean;
  created_at: string;
  items: RecipeItem[];
}

interface Props {
  recipes: Recipe[];
}

export default function RugPricingIndex({ recipes: initialRecipes }: Props) {
  const dispatch = useAppDispatch();
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(initialRecipes);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    if (searchQuery) {
      const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchQuery, recipes]);

  const handleDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    router.delete(`/admin/rug-pricing/${recipeToDelete.id}`, {
      onSuccess: () => {
        dispatch(showNotification({
          type: 'success',
          message: 'Recipe deleted successfully',
        }));
        setRecipes(recipes.filter(r => r.id !== recipeToDelete.id));
        setDeleteDialogOpen(false);
        setRecipeToDelete(null);
      },
      onError: () => {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to delete recipe',
        }));
      },
    });
  };

  const columns: Column<Recipe>[] = [
    {
      header: 'Recipe Name',
      sortable: true,
      sortKey: 'name',
      accessor: (recipe) => (
        <div>
          <div className="font-medium text-gray-900">{recipe.name}</div>
          {recipe.description && (
            <div className="text-sm text-gray-500">{recipe.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Reference Size',
      accessor: (recipe) => recipe.reference_width_cm && recipe.reference_height_cm ? (
        <span className="text-sm text-gray-700">
          {recipe.reference_width_cm} × {recipe.reference_height_cm} cm
        </span>
      ) : (
        <span className="text-sm text-gray-400">Not set</span>
      ),
    },
    {
      header: 'Ref. Price',
      accessor: (recipe) => recipe.reference_price ? (
        <span className="text-sm font-medium text-gray-900">${Number(recipe.reference_price).toFixed(2)}</span>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      ),
    },
    {
      header: 'Profit Margin',
      accessor: (recipe) => (
        <span className="text-sm text-gray-700">{Number(recipe.profit_margin_percentage || 0)}%</span>
      ),
    },
    {
      header: 'Materials',
      accessor: (recipe) => (
        <Badge variant="secondary">{recipe.items?.length || 0} items</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (recipe) => (
        <Badge variant={recipe.is_active ? 'default' : 'secondary'}>
          {recipe.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (recipe) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.get(`/admin/rug-pricing/${recipe.id}/edit`);
            }}
            className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(recipe);
            }}
            className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head title="Rug Pricing Recipes" />
      
      <div className="flex h-full flex-1 flex-col gap-8 bg-gradient-to-br from-[#F4F4F1] via-[#ECECE9] to-[#E8E8E5] p-8 lg:p-12">
        {/* Header Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/60 bg-gradient-to-br from-[#2A2A2E] via-[#3A3A42] to-[#2A2A2E] p-10">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5C563]"></span>
              Pricing Management
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white">
              Rug Pricing Recipes
            </h1>
            <p className="mt-3 text-base font-medium text-white/70">
              Manage pricing recipes and calculate rug costs based on materials
            </p>
          </div>
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#F5C563]/20 blur-[100px]"></div>
          <div className="absolute -bottom-12 right-24 h-56 w-56 rounded-full bg-[#7FBB92]/15 blur-[100px]"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            className="rounded-xl"
            variant="outline"
            onClick={() => router.get('/admin/rug-pricing/calculator')}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Price Calculator
          </Button>
          <Button className="rounded-xl" onClick={() => router.get('/admin/rug-pricing/create')}>
            <DollarSign className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6 backdrop-blur-sm">
          <Input
            className="rounded-xl"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6 backdrop-blur-sm">
          {filteredRecipes.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.dollarSign}
              title="No pricing recipes found"
              description={
                searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first pricing recipe to start calculating rug costs'
              }
              action={
                !searchQuery ? (
                  <Button onClick={() => router.get('/admin/rug-pricing/create')}>
                    Create Recipe
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredRecipes}
              onRowClick={(recipe) => router.get(`/admin/rug-pricing/${recipe.id}/edit`)}
            />
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{recipeToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

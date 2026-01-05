import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Package,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
  FileText,
  History,
  Wrench,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { deleteInventoryItem, InventoryItem as ReduxInventoryItem } from '@/store/slices/inventorySlice';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  type: string;
  unit: string;
  current_stock: number;
  average_cost?: number;
  unit_cost?: number;
  reorder_point: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface StockTransaction {
  id: number;
  reference_type: string;
  quantity_change: number;
  unit_cost_before: number;
  unit_cost_after: number;
  notes: string | null;
  created_at: string;
  created_by?: {
    id: number;
    name: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: number | null;
  onEdit?: (item: ReduxInventoryItem) => void;
  onAdjust?: (item: ReduxInventoryItem) => void;
  onDeleted?: () => void;
}

export function InventoryDetailDrawer({ open, onClose, itemId, onEdit, onAdjust, onDeleted }: Props) {
  const dispatch = useAppDispatch();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && itemId) {
      fetchItemDetails();
    }
  }, [open, itemId]);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/inventory/${itemId}`);
      setItem(response.data.data);
      // Fetch transactions if available
      try {
        const txResponse = await axios.get(`/admin/inventory/${itemId}/transactions`);
        setTransactions(txResponse.data.data || []);
      } catch {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to load inventory item details',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteInventoryItem(item.id)).unwrap();
        dispatch(showNotification({
          type: 'success',
          message: 'Inventory item deleted successfully',
        }));
        onDeleted?.();
        onClose();
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to delete inventory item',
        }));
      }
    }
  };

  const getStockStatusBadge = () => {
    if (!item) return null;
    
    if (item.current_stock <= 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    }
    if (item.current_stock <= item.reorder_point) {
      return <Badge variant="default" className="bg-yellow-500 text-white text-xs">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600 text-white text-xs">In Stock</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      yarn: 'Yarn',
      tufting_cloth: 'Tufting Cloth',
      backing_cloth: 'Backing Cloth',
      carpet_tile_vinyl: 'Carpet Tile Vinyl',
      backing_glue: 'Backing Glue',
      glue_stick: 'Glue Stick',
      accessory: 'Accessory',
    };
    return typeMap[type] || type;
  };

  if (!item && !loading) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[75vw] sm:max-w-[75vw] overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : item ? (
          <div className="h-full flex flex-col overflow-hidden">
            <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-2xl font-bold">{item.name}</SheetTitle>
                  <SheetDescription className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">{item.sku}</span>
                    {getStockStatusBadge()}
                  </SheetDescription>
                </div>
                <div className="flex items-center gap-2">
                  {onAdjust && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onAdjust(item as ReduxInventoryItem)}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Adjust Stock
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item as ReduxInventoryItem)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {item.current_stock <= item.reorder_point && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Low Stock Alert</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Current stock ({item.current_stock} {item.unit}) is at or below reorder point ({item.reorder_point} {item.unit})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SheetHeader>

            <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-4 grid w-full grid-cols-2 bg-transparent h-auto p-0 border-b flex-shrink-0">
                <TabsTrigger 
                  value="details" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <FileText className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <History className="h-4 w-4" />
                  <span>Stock History</span>
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                {/* Basic Information */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">SKU</p>
                      <p className="font-mono font-medium">{item.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{getTypeLabel(item.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit of Measure</p>
                      <p className="font-medium">{item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStockStatusBadge()}
                    </div>
                  </div>
                  {item.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm mt-1">{item.description}</p>
                    </div>
                  )}
                </div>

                {/* Stock Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Stock Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
                      <p className="text-3xl font-bold text-blue-600">{item.current_stock}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Reorder Point</p>
                      <p className="text-3xl font-bold text-orange-600">{item.reorder_point}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Average Cost</p>
                      <p className="text-3xl font-bold text-green-600">${Number(item.average_cost || item.unit_cost || 0).toFixed(8)}</p>
                      <p className="text-xs text-muted-foreground mt-1">per {item.unit}</p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Record Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDateTime(item.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDateTime(item.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                <div className="border rounded-lg">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No stock transactions recorded yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {tx.quantity_change > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium">
                                  {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change} {item.unit}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {tx.reference_type.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Cost: ${tx.unit_cost_before.toFixed(8)} → ${tx.unit_cost_after.toFixed(8)}
                              </p>
                              {tx.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{tx.notes}</p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>{formatDateTime(tx.created_at)}</p>
                              {tx.created_by && (
                                <p className="text-xs mt-1">by {tx.created_by.name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

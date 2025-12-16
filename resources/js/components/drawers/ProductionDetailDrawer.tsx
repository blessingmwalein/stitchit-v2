import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionStateBadge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Package,
  User,
  Calendar,
  Clock,
  DollarSign,
  Scissors,
  ChevronRight,
  Edit2,
  Save,
  X,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  CheckCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import axios from 'axios';
import { AddMaterialModal } from '@/components/modals/AddMaterialModal';

interface MaterialConsumption {
  id: number;
  inventory_item: {
    id: number;
    name: string;
    color?: string;
    unit: string;
  };
  type: 'estimated' | 'actual';
  consumed_quantity: number;
  waste_quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface ProductionJob {
  id: number;
  reference: string;
  state: string;
  planned_start_at?: string;
  planned_end_at?: string;
  actual_start_at?: string;
  actual_end_at?: string;
  estimated_material_cost: number;
  actual_material_cost: number;
  estimated_labor_hours: number;
  actual_labor_hours: number;
  notes?: string;
  order_item: {
    id: number;
    description: string;
    width: number;
    height: number;
    quantity: number;
    price_per_item: number;
    design_image_url?: string;
    order: {
      id: number;
      reference: string;
      client: {
        id: number;
        full_name: string;
        phone: string;
        address?: string;
      };
    };
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  material_consumptions?: MaterialConsumption[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  jobId: number | null;
}

export function ProductionDetailDrawer({ open, onClose, jobId }: Props) {
  const { toast } = useToast();
  const [job, setJob] = useState<ProductionJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<number | null>(null);
  const [materialValues, setMaterialValues] = useState<{ [key: number]: { quantity: number; waste: number } }>({});
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (open && jobId) {
      fetchJobDetails();
    }
  }, [open, jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/production/${jobId}`);
      setJob(response.data.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = (newState: string) => {
    setPendingTransition(newState);
    setShowTransitionDialog(true);
  };

  const confirmTransition = async () => {
    if (!pendingTransition) return;

    try {
      await axios.post(`/admin/production/${jobId}/transition`, { 
        state: pendingTransition 
      });
      
      await fetchJobDetails();
      
      toast({
        title: 'Success',
        description: `Job transitioned to ${pendingTransition.replace(/_/g, ' ')}`,
      });
    } catch (error: any) {
      console.error('Error transitioning job:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to transition job',
        variant: 'destructive',
      });
    } finally {
      setShowTransitionDialog(false);
      setPendingTransition(null);
    }
  };
  const handleSaveMaterial = async (consumptionId: number) => {
    const values = materialValues[consumptionId];
    if (!values) return;

    try {
      await axios.put(`/admin/production/${jobId}/consume/${consumptionId}`, {
        consumed_quantity: values.quantity,
        waste_quantity: values.waste,
      });
      setEditingMaterial(null);
      await fetchJobDetails();
      toast({
        title: 'Success',
        description: 'Material updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating material:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update material',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMaterial = (consumptionId: number) => {
    setPendingDeleteId(consumptionId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!pendingDeleteId) return;

    try {
      await axios.delete(`/admin/production/${jobId}/consume/${pendingDeleteId}`);
      await fetchJobDetails();
      toast({
        title: 'Success',
        description: 'Material deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete material',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setPendingDeleteId(null);
    }
  };

  const estimatedMaterials = job?.material_consumptions?.filter(m => m.type === 'estimated') || [];
  const actualMaterials = job?.material_consumptions?.filter(m => m.type === 'actual') || [];

  const nextState = () => {
    const transitions: { [key: string]: string } = {
      'PLANNED': 'MATERIALS_ALLOCATED',
      'MATERIALS_ALLOCATED': 'TUFTING',
      'TUFTING': 'FINISHING',
      'FINISHING': 'QUALITY_CHECK',
      'QUALITY_CHECK': 'COMPLETED',
    };
    return job ? transitions[job.state] : null;
  };

  if (!job && !loading) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[75vw] sm:max-w-[75vw] overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : job ? (
          <div className="h-full flex flex-col overflow-hidden">
            <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-2xl font-bold">{job.reference}</SheetTitle>
                  <SheetDescription>Production job details and management</SheetDescription>
                </div>
                <div className="flex items-center gap-3">
                  <ProductionStateBadge state={job.state} />
                  {nextState() && (
                    <Button
                      onClick={() => handleTransition(nextState()!)}
                      size="sm"
                    >
                      Move to {nextState()?.replace(/_/g, ' ')}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-4 grid w-full grid-cols-3 bg-transparent h-auto p-0 border-b flex-shrink-0">
                <TabsTrigger 
                  value="details" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <FileText className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="estimated" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Estimated</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="actual" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Actual</span>
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                {/* Order Information */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Reference</p>
                      <p className="font-mono font-medium">{job.order_item.order.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{job.order_item.order.client.full_name}</p>
                      <p className="text-sm text-muted-foreground">{job.order_item.order.client.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Item Details
                  </h3>
                  <div className="flex gap-4">
                    {job.order_item.design_image_url && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={job.order_item.design_image_url}
                          alt="Design"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="font-medium">{job.order_item.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Dimensions</p>
                          <p className="font-medium">{job.order_item.width} × {job.order_item.height} cm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{job.order_item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">${Number(job.order_item.price_per_item || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline & Assignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Planned Start</p>
                        <p className="text-sm">{job.planned_start_at ? formatDate(job.planned_start_at) : 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Planned End</p>
                        <p className="text-sm">{job.planned_end_at ? formatDate(job.planned_end_at) : 'Not set'}</p>
                      </div>
                      {job.actual_start_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Actual Start</p>
                          <p className="text-sm font-medium">{formatDate(job.actual_start_at)}</p>
                        </div>
                      )}
                      {job.actual_end_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Actual End</p>
                          <p className="text-sm font-medium">{formatDate(job.actual_end_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assignment
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p className="font-medium">{job.assigned_to?.name || 'Unassigned'}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Change Assignment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cost Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Material Cost</p>
                      <p className="text-lg font-bold">${Number(job.estimated_material_cost || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Material Cost</p>
                      <p className="text-lg font-bold text-green-600">${Number(job.actual_material_cost || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Labor Hours</p>
                      <p className="text-lg font-bold">{Number(job.estimated_labor_hours || 0).toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Labor Hours</p>
                      <p className="text-lg font-bold text-green-600">{Number(job.actual_labor_hours || 0).toFixed(1)}h</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {job.notes && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
                  </div>
                )}
              </TabsContent>

              {/* Estimated Materials Tab */}
              <TabsContent value="estimated" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Estimated Cost Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Material Cost</p>
                      <p className="text-2xl font-bold">${Number(job.estimated_material_cost || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Labor Hours</p>
                      <p className="text-2xl font-bold">{Number(job.estimated_labor_hours || 0).toFixed(1)}h</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Estimated Materials</h3>
                  {estimatedMaterials.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No materials estimated yet</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        + Estimate Materials
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {estimatedMaterials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {material.inventory_item.name}
                              {material.inventory_item.color && (
                                <span className="ml-2 text-muted-foreground">({material.inventory_item.color})</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {material.consumed_quantity} {material.inventory_item.unit} • ${Number(material.total_cost || 0).toFixed(2)}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Actual Materials Tab */}
              <TabsContent value="actual" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Actual Cost Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Material Cost</p>
                      <p className="text-2xl font-bold text-green-600">${Number(job.actual_material_cost || 0).toFixed(2)}</p>
                      {Number(job.estimated_material_cost || 0) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Variance: ${(Number(job.actual_material_cost || 0) - Number(job.estimated_material_cost || 0)).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Labor Hours</p>
                      <p className="text-2xl font-bold text-green-600">{Number(job.actual_labor_hours || 0).toFixed(1)}h</p>
                      {Number(job.estimated_labor_hours || 0) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Variance: {(Number(job.actual_labor_hours || 0) - Number(job.estimated_labor_hours || 0)).toFixed(1)}h
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Actual Materials Used</h3>
                    <Button 
                      size="sm" 
                      onClick={() => setShowAddMaterialModal(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Material
                    </Button>
                  </div>
                  {actualMaterials.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground mb-2">No materials recorded yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Start recording materials as they are used in production</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddMaterialModal(true)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Record Material Usage
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actualMaterials.map((material) => (
                        <div key={material.id} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          {editingMaterial === material.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Used Quantity</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={materialValues[material.id]?.quantity || material.consumed_quantity}
                                    onChange={(e) => setMaterialValues({
                                      ...materialValues,
                                      [material.id]: {
                                        ...materialValues[material.id],
                                        quantity: parseFloat(e.target.value),
                                        waste: materialValues[material.id]?.waste || material.waste_quantity,
                                      }
                                    })}
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Waste</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={materialValues[material.id]?.waste || material.waste_quantity}
                                    onChange={(e) => setMaterialValues({
                                      ...materialValues,
                                      [material.id]: {
                                        quantity: materialValues[material.id]?.quantity || material.consumed_quantity,
                                        waste: parseFloat(e.target.value),
                                      }
                                    })}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveMaterial(material.id)}>
                                  <Save className="h-3 w-3 mr-1" /> Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingMaterial(null)}>
                                  <X className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {material.inventory_item.name}
                                  {material.inventory_item.color && (
                                    <span className="ml-2 text-muted-foreground">({material.inventory_item.color})</span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Used: {material.consumed_quantity} {material.inventory_item.unit} • 
                                  Waste: {material.waste_quantity || 0} {material.inventory_item.unit} • 
                                  ${Number(material.total_cost || 0).toFixed(2)}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setEditingMaterial(material.id)}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
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

      {/* Add Material Modal */}
      {jobId && (
        <AddMaterialModal
          open={showAddMaterialModal}
          onClose={() => setShowAddMaterialModal(false)}
          jobId={jobId}
          onSuccess={fetchJobDetails}
          jobDimensions={job?.order_item ? {
            length: job.order_item.height,
            width: job.order_item.width
          } : undefined}
        />
      )}

      {/* Transition Confirmation Dialog */}
      <AlertDialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stage Transition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this job to <span className="font-semibold">{pendingTransition?.replace(/_/g, ' ')}</span>?
              This action will update the production status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowTransitionDialog(false);
              setPendingTransition(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmTransition}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Material Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this material record? This will restore the inventory and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setPendingDeleteId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMaterial}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

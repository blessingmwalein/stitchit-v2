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
import { CompleteJobModal } from '@/components/modals/CompleteJobModal';
import { EstimateMaterialsModal } from '@/components/modals/EstimateMaterialsModal';
import { CreateFinishedProductModal } from '@/components/modals/CreateFinishedProductModal';
import { EditFinishedProductModal } from '@/components/modals/EditFinishedProductModal';

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

interface FinishedProduct {
  id: number;
  reference: string;
  product_name: string;
  description?: string;
  quality_status: string;
  quality_notes?: string;
  storage_location?: string;
  status: string;
  primary_image?: string;
  images?: string[];
  is_published: boolean;
  published_at?: string;
  notes?: string;
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
  finished_product?: FinishedProduct;
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showCreateFinishedProductModal, setShowCreateFinishedProductModal] = useState(false);
  const [showEditFinishedProductModal, setShowEditFinishedProductModal] = useState(false);

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
    // If transitioning to COMPLETED, show the completion modal
    if (newState === 'COMPLETED') {
      setShowCompleteModal(true);
    } else {
      setPendingTransition(newState);
      setShowTransitionDialog(true);
    }
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

  const handleTogglePublish = async () => {
    if (!job?.finished_product) return;

    try {
      await axios.post(`/admin/finished-products/${job.finished_product.id}/publish`);
      await fetchJobDetails();
      toast({
        title: 'Success',
        description: job.finished_product.is_published ? 'Product unpublished' : 'Product published',
      });
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update publish status',
        variant: 'destructive',
      });
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
              <TabsList className="mx-6 mt-4 grid w-full grid-cols-4 bg-transparent h-auto p-0 border-b flex-shrink-0">
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
                <TabsTrigger 
                  value="finished" 
                  className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
                >
                  <Package className="h-4 w-4" />
                  <span>Finished Product</span>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setShowEstimateModal(true)}
                      >
                        + Estimate Materials from Recipe
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

              {/* Finished Product Tab */}
              <TabsContent value="finished" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-6">
                {job.finished_product ? (
                  <>
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{job.finished_product.product_name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={job.finished_product.is_published ? "default" : "secondary"}>
                            {job.finished_product.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowEditFinishedProductModal(true)}
                          >
                            <Edit2 className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={job.finished_product.is_published ? "secondary" : "default"}
                            onClick={handleTogglePublish}
                          >
                            {job.finished_product.is_published ? "Unpublish" : "Publish"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.finished_product.reference}</p>
                    </div>

                    {/* Primary Image */}
                    {job.finished_product.primary_image && (
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={job.finished_product.primary_image}
                          alt={job.finished_product.product_name}
                          className="w-full h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Description */}
                    {job.finished_product.description && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{job.finished_product.description}</p>
                      </div>
                    )}

                    {/* Additional Images */}
                    {job.finished_product.images && job.finished_product.images.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Additional Images</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {job.finished_product.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Additional ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Quality</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={
                              job.finished_product.quality_status === 'PASSED' ? 'default' :
                              job.finished_product.quality_status === 'NEEDS_REWORK' ? 'secondary' : 'destructive'
                            }>
                              {job.finished_product.quality_status}
                            </Badge>
                          </div>
                          {job.finished_product.quality_notes && (
                            <div>
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p className="text-sm">{job.finished_product.quality_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Storage & Status</h4>
                        <div className="space-y-2">
                          {job.finished_product.storage_location && (
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="text-sm font-medium">{job.finished_product.storage_location}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="outline">{job.finished_product.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {job.finished_product.notes && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.finished_product.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Finished Product Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create a finished product entry to document the completed item
                    </p>
                    <Button 
                      onClick={() => setShowCreateFinishedProductModal(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Finished Product
                    </Button>
                  </div>
                )}
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

      {/* Complete Job Modal */}
      {jobId && job && (
        <CompleteJobModal
          open={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          jobId={jobId}
          jobReference={job.reference}
          onSuccess={() => {
            fetchJobDetails();
            onClose();
          }}
        />
      )}

      {/* Estimate Materials Modal */}
      {jobId && job && (
        <EstimateMaterialsModal
          open={showEstimateModal}
          onClose={() => setShowEstimateModal(false)}
          jobId={jobId}
          jobDimensions={{
            width: job.order_item.width,
            height: job.order_item.height,
          }}
          onSuccess={fetchJobDetails}
        />
      )}

      {/* Create Finished Product Modal */}
      {jobId && job && (
        <CreateFinishedProductModal
          open={showCreateFinishedProductModal}
          onClose={() => setShowCreateFinishedProductModal(false)}
          jobId={jobId}
          jobReference={job.reference}
          onSuccess={fetchJobDetails}
        />
      )}

      {/* Edit Finished Product Modal */}
      {jobId && job && job.finished_product && (
        <EditFinishedProductModal
          open={showEditFinishedProductModal}
          onClose={() => setShowEditFinishedProductModal(false)}
          product={job.finished_product}
          onSuccess={fetchJobDetails}
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

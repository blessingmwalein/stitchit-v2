import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Package, Calendar, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: number;
  description: string;
  width: string;
  height: string;
  quantity: number;
  price_per_item: number;
  sku?: string;
  design_image_url?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: number;
  orderReference: string;
  items: OrderItem[];
  onSuccess?: () => void;
}

export function StartProductionModal({ open, onClose, orderId, orderReference, items, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [convertAll, setConvertAll] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [plannedStartDate, setPlannedStartDate] = useState<Date | undefined>();
  const [plannedEndDate, setPlannedEndDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');

  const selectedItem = items.find(item => item.id.toString() === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (convertAll) {
        // Convert all items
        await axios.post(`/admin/orders/${orderId}/convert-to-production`);
        
        toast({
          title: 'Success',
          description: `All items from order ${orderReference} converted to production`,
        });

        // Redirect to production page
        router.visit('/admin/production');
      } else {
        // Convert single item
        if (!selectedItemId) {
          toast({
            title: 'Error',
            description: 'Please select an order item',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        await axios.post('/admin/production', {
          order_item_id: parseInt(selectedItemId),
          planned_start_date: plannedStartDate ? plannedStartDate.toISOString().split('T')[0] : null,
          planned_end_date: plannedEndDate ? plannedEndDate.toISOString().split('T')[0] : null,
          notes: notes || null,
        });

        toast({
          title: 'Success',
          description: 'Production job created successfully',
        });

        // Redirect to production page
        router.visit('/admin/production');
      }

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start production',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConvertAll(false);
    setSelectedItemId('');
    setPlannedStartDate(undefined);
    setPlannedEndDate(undefined);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Start Production</DialogTitle>
          <DialogDescription>
            Create production job(s) for order {orderReference}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 px-1">
          {/* Conversion Mode Selection */}
          <div className="space-y-3">
            <Label>Conversion Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConvertAll(false)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  !convertAll
                    ? 'border-[#FF8A50] bg-orange-50 dark:bg-orange-950/20 text-[#FF8A50]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="h-5 w-5 mx-auto mb-2" />
                <span className="font-medium">Single Item</span>
                <p className="text-xs text-muted-foreground mt-1">Create job for one item</p>
              </button>
              <button
                type="button"
                onClick={() => setConvertAll(true)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  convertAll
                    ? 'border-[#FF8A50] bg-orange-50 dark:bg-orange-950/20 text-[#FF8A50]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="h-5 w-5 mx-auto mb-2" />
                <span className="font-medium">All Items</span>
                <p className="text-xs text-muted-foreground mt-1">Convert all at once</p>
              </button>
            </div>
          </div>

          {!convertAll && (
            <>
              {/* Item Selection */}
              <div className="space-y-2">
                <Label htmlFor="item">Select Order Item *</Label>
                <Select
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.description} ({item.width}×{item.height}cm) - Qty: {item.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Item Preview */}
              {selectedItem && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {selectedItem.design_image_url ? (
                        <img
                          src={selectedItem.design_image_url}
                          alt={selectedItem.description}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{selectedItem.description}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Dimensions</p>
                            <p className="font-medium">{selectedItem.width} × {selectedItem.height} cm</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{selectedItem.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Planning Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Planned Start Date</Label>
                  <DatePicker
                    date={plannedStartDate}
                    onDateChange={setPlannedStartDate}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Planned End Date</Label>
                  <DatePicker
                    date={plannedEndDate}
                    onDateChange={setPlannedEndDate}
                    placeholder="Select end date"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Production Notes</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add any production notes or special instructions..."
                />
              </div>
            </>
          )}

          {convertAll && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Convert All Items</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    This will create individual production jobs for all {items.length} item(s) in this order.
                  </p>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.description}</span>
                        <span className="text-muted-foreground">({item.width}×{item.height}cm)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!convertAll && !selectedItemId)}
              className="bg-[#FF8A50] hover:bg-[#FF9B71]"
            >
              {loading ? 'Creating...' : convertAll ? `Create ${items.length} Production Job(s)` : 'Create Production Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  Package,
  Edit,
  Trash2,
  FileText,
  ClipboardList,
  Truck,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { deletePurchaseOrder, PurchaseOrder as ReduxPurchaseOrder } from '@/store/slices/purchasesSlice';

interface PurchaseOrder {
  id: number;
  reference: string;
  state: string;
  expected_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  journal_entry?: {
    id: number;
    reference: string;
    status: string;
  };
  supplier?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  };
  lines?: PurchaseOrderLine[];
  receiving_history?: ReceivingRecord[];
}

interface PurchaseOrderLine {
  id: number;
  inventory_item_id: number;
  quantity_ordered: number;
  unit_cost: number;
  quantity_received: number;
  inventory_item?: {
    id: number;
    sku: string;
    name: string;
    unit: string;
  };
}

interface ReceivingRecord {
  id: number;
  received_at: string;
  notes: string | null;
  received_by?: {
    id: number;
    name: string;
  };
  items: Array<{
    inventory_item_name: string;
    quantity: number;
    unit: string;
  }>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  poId: number | null;
  onEdit?: (po: ReduxPurchaseOrder) => void;
  onReceive?: (po: ReduxPurchaseOrder) => void;
  onSend?: (po: ReduxPurchaseOrder) => void;
  onDeleted?: () => void;
}

export function PurchaseDetailDrawer({ open, onClose, poId, onEdit, onReceive, onSend, onDeleted }: Props) {
  const dispatch = useAppDispatch();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: async () => {},
  });

  useEffect(() => {
    if (open && poId) {
      fetchPODetails();
    }
  }, [open, poId]);

  const fetchPODetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/purchases/${poId}`);
      setPo(response.data.data);
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to load purchase order details',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!po) return;
    
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await dispatch(deletePurchaseOrder(po.id)).unwrap();
        dispatch(showNotification({
          type: 'success',
          message: 'Purchase order deleted successfully',
        }));
        onDeleted?.();
        onClose();
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: 'Failed to delete purchase order',
        }));
      }
    }
  };

  const getStateBadge = (state: string) => {
    const stateColors: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; className?: string }> = {
      DRAFT: { variant: 'secondary' },
      SENT: { variant: 'default', className: 'bg-blue-500 text-white' },
      PARTIALLY_RECEIVED: { variant: 'default', className: 'bg-yellow-500 text-white' },
      RECEIVED: { variant: 'default', className: 'bg-green-600 text-white' },
      CLOSED: { variant: 'outline' },
    };

    const config = stateColors[state] || { variant: 'outline' as const };
    const label = state.replace(/_/g, ' ');

    return (
      <Badge variant={config.variant} className={config.className}>
        {label}
      </Badge>
    );
  };

  if (loading || !po) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[75vw] sm:max-w-[75vw] overflow-y-auto p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Loading...</SheetTitle>
            <SheetDescription>Please wait while we load the purchase order details</SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading purchase order...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const totalValue = po.lines?.reduce((sum, line) => {
    const unitCost = parseFloat(String(line.unit_cost)) || 0;
    const quantity = parseFloat(String(line.quantity_ordered)) || 0;
    return sum + (quantity * unitCost);
  }, 0) || 0;
  const receivedValue = po.lines?.reduce((sum, line) => {
    const unitCost = parseFloat(String(line.unit_cost)) || 0;
    const receivedQty = parseFloat(String(line.quantity_received)) || 0;
    return sum + (receivedQty * unitCost);
  }, 0) || 0;
  const receivingProgress = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[75vw] sm:max-w-[75vw] overflow-y-auto p-0">
        <div className="h-full flex flex-col overflow-hidden">
          <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold">{po.reference}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm">{po.supplier?.name}</span>
                  {getStateBadge(po.state)}
                </SheetDescription>
              </div>
            <div className="flex items-center gap-2">
              {po.state === 'DRAFT' && onSend && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      action: async () => {
                        onSend(po as ReduxPurchaseOrder);
                      },
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Mark as Bought
                </Button>
              )}
              {(po.state === 'SENT' || po.state === 'PARTIALLY_RECEIVED') && onReceive && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onReceive(po as ReduxPurchaseOrder)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Receive Goods
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(po as ReduxPurchaseOrder)}
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
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="details" className="w-full">
            <div className="border-b px-6">
              <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="lines" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Order Lines ({po.lines?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="receiving" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Receiving History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="p-6 m-0">
              <div className="space-y-6">
                {/* Supplier Information */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Supplier Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{po.supplier?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{po.supplier?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{po.supplier?.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Order Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Reference</p>
                      <p className="font-medium font-mono">{po.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <div className="mt-1">{getStateBadge(po.state)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium">
                        {po.expected_date 
                          ? formatDate(po.expected_date)
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Lines</p>
                      <p className="font-medium">{po.lines?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${totalValue.toFixed(8)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-muted-foreground">Received Value</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${receivedValue.toFixed(8)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {receivingProgress.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accounting Integration */}
                {po.journal_entry && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Accounting
                    </h3>
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Journal Entry</p>
                          <p className="font-medium font-mono">{po.journal_entry.reference}</p>
                          <Badge 
                            variant={po.journal_entry.status === 'POSTED' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {po.journal_entry.status}
                          </Badge>
                        </div>
                        <Link href={`/admin/accounting/journal-entries`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Entry
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {po.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Notes
                    </h3>
                    <p className="text-sm bg-muted/50 p-4 rounded-lg">{po.notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Record Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="text-sm">{formatDateTime(po.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{formatDateTime(po.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lines" className="p-6 m-0">
              {po.lines && po.lines.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">SKU</th>
                          <th className="text-left p-3 text-sm font-semibold">Item</th>
                          <th className="text-right p-3 text-sm font-semibold">Quantity</th>
                          <th className="text-right p-3 text-sm font-semibold">Unit Cost</th>
                          <th className="text-right p-3 text-sm font-semibold">Subtotal</th>
                          <th className="text-right p-3 text-sm font-semibold">Received</th>
                          <th className="text-center p-3 text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.lines.map((line) => {
                          const unitCost = parseFloat(String(line.unit_cost)) || 0;
                          const quantityOrdered = parseFloat(String(line.quantity_ordered)) || 0;
                          const quantityReceived = parseFloat(String(line.quantity_received)) || 0;
                          const subtotal = quantityOrdered * unitCost;
                          const isFullyReceived = quantityReceived >= quantityOrdered;
                          const isPartiallyReceived = quantityReceived > 0 && quantityReceived < quantityOrdered;
                          
                          return (
                            <tr key={line.id} className="border-t hover:bg-muted/50">
                              <td className="p-3 text-sm font-mono">{line.inventory_item?.sku}</td>
                              <td className="p-3 text-sm">{line.inventory_item?.name}</td>
                              <td className="p-3 text-sm text-right">
                                {quantityOrdered} {line.inventory_item?.unit}
                              </td>
                              <td className="p-3 text-sm text-right">${unitCost.toFixed(8)}</td>
                              <td className="p-3 text-sm text-right font-medium">${subtotal.toFixed(8)}</td>
                              <td className="p-3 text-sm text-right">
                                {quantityReceived} / {quantityOrdered}
                              </td>
                              <td className="p-3 text-center">
                                {isFullyReceived ? (
                                  <Badge variant="default" className="bg-green-600 text-white text-xs">
                                    Received
                                  </Badge>
                                ) : isPartiallyReceived ? (
                                  <Badge variant="default" className="bg-yellow-500 text-white text-xs">
                                    Partial
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Pending
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-muted/50 border-t">
                        <tr>
                          <td colSpan={4} className="p-3 text-right font-semibold">Total:</td>
                          <td className="p-3 text-right font-bold text-lg">${totalValue.toFixed(8)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No order lines</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="receiving" className="p-6 m-0">
              {po.receiving_history && po.receiving_history.length > 0 ? (
                <div className="space-y-4">
                  {po.receiving_history.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">
                            {formatDateTime(record.received_at)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Received by: {record.received_by?.name || 'Unknown'}
                          </p>
                        </div>
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {record.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.inventory_item_name}</span>
                            <span className="font-medium">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {record.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">Notes:</p>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No receiving history</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </SheetContent>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.action}
        title="Mark Purchase as Bought?"
        description="Mark this purchase as bought and received? This will update inventory stock immediately."
        confirmText="Mark as Bought"
        cancelText="Cancel"
      />
    </Sheet>
  );
}

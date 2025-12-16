import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderStateBadge } from '@/components/ui/badge';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { StartProductionModal } from '@/components/modals/StartProductionModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { formatDate } from '@/lib/utils';
import axios from 'axios';
import { 
  Calendar, 
  User, 
  Package, 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Hammer,
  Download,
  ExternalLink
} from 'lucide-react';

interface OrderItem {
  id: number;
  order_id: number;
  sku?: string;
  description: string;
  quantity: number;
  width: string;
  height: string;
  unit: string;
  area: string;
  planned_price: string;
  notes?: string;
  design_image_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface Payment {
  id: number;
  amount: number;
  paid_at: string;
  method: string;
  type: string;
  reference?: string;
  created_at: string;
  journal_entry?: {
    id: number;
    reference: string;
    status: string;
  };
}

interface Order {
  id: number;
  reference: string;
  client_id: number;
  client?: {
    id: number;
    phone: string;
    full_name: string;
    nickname?: string;
    address?: string;
    gender?: string;
  };
  state: string;
  deposit_percent: string;
  deposit_required_amount: string;
  total_amount: string;
  balance_due: string;
  notes?: string;
  delivery_address?: string;
  delivery_contact?: string;
  preferred_dimensions_unit: string;
  items_count?: number;
  items?: OrderItem[];
  payments?: Payment[];
  journal_entries?: Array<{
    id: number;
    reference: string;
    type: string;
    status: string;
  }>;
  dispatch?: any;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
  onOrderUpdated?: () => void;
}

export function OrderDetailDrawer({ open, onClose, orderId, onOrderUpdated }: OrderDetailDrawerProps) {
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    action: async () => {},
    variant: 'default',
  });

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails(orderId);
    } else if (!open) {
      // Reset order when drawer closes
      setOrder(null);
    }
  }, [open, orderId]);

  const fetchOrderDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/orders/${id}`);
      setOrder(response.data.data);
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load order details',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleTransitionState = async (targetState: string) => {
    if (!orderId || !order) return;

    const stateLabels: Record<string, string> = {
      'PENDING_DEPOSIT': 'Request Deposit',
      'DEPOSIT_PAID': 'Mark Deposit Paid',
      'IN_PRODUCTION': 'Start Production',
      'READY_FOR_DISPATCH': 'Mark Ready for Dispatch',
      'DISPATCHED': 'Dispatch Order',
      'CLOSED': 'Close Order',
      'ARCHIVED': 'Archive Order',
    };

    setConfirmDialog({
      open: true,
      title: `${stateLabels[targetState] || 'Update Order'}?`,
      description: `Are you sure you want to transition this order to ${targetState.replace('_', ' ').toLowerCase()}?`,
      variant: targetState === 'ARCHIVED' ? 'destructive' : 'default',
      action: async () => {
        await axios.post(`/admin/orders/${orderId}/transition`, {
          state: targetState,
        });

        dispatch(showNotification({
          type: 'success',
          message: `Order transitioned to ${targetState.replace('_', ' ')}`,
        }));

        if (orderId) fetchOrderDetails(orderId);
        onOrderUpdated?.();
      },
    });
  };

  const handleConvertToProduction = () => {
    setShowProductionModal(true);
  };

  const handleProductionSuccess = () => {
    // Close the order drawer
    onClose();
    // The modal will handle the redirect to production page
  };

  const handlePaymentSuccess = () => {
    if (orderId) fetchOrderDetails(orderId);
    onOrderUpdated?.();
  };

  const handleDownloadPDF = async () => {
    if (!orderId) return;

    try {
      const response = await axios.get(`/admin/orders/${orderId}/download-pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${order?.reference || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      dispatch(showNotification({
        type: 'success',
        message: 'PDF downloaded successfully',
      }));
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to download PDF',
      }));
    }
  };

  const getAvailableTransitions = () => {
    if (!order) return [];

    const transitions: { state: string; label: string; variant: 'default' | 'destructive' | 'outline' }[] = [];

    switch (order.state) {
      case 'DRAFT':
        transitions.push({ state: 'PENDING_DEPOSIT', label: 'Request Deposit', variant: 'default' });
        transitions.push({ state: 'ARCHIVED', label: 'Archive', variant: 'destructive' });
        break;
      case 'PENDING_DEPOSIT':
        transitions.push({ state: 'DEPOSIT_PAID', label: 'Mark Deposit Paid', variant: 'default' });
        transitions.push({ state: 'ARCHIVED', label: 'Archive', variant: 'destructive' });
        break;
      case 'DEPOSIT_PAID':
        // Start Production handled by modal, not transition
        break;
      case 'IN_PRODUCTION':
        transitions.push({ state: 'READY_FOR_DISPATCH', label: 'Mark Ready', variant: 'default' });
        break;
      case 'READY_FOR_DISPATCH':
        transitions.push({ state: 'DISPATCHED', label: 'Dispatch Order', variant: 'default' });
        break;
      case 'DISPATCHED':
        if (order.balance_due <= 0) {
          transitions.push({ state: 'CLOSED', label: 'Close Order', variant: 'default' });
        }
        break;
    }

    return transitions;
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8A50]"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="sm:max-w-[50vw] w-[50vw] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <span>Order Details</span>
                    <OrderStateBadge state={order.state} />
                  </SheetTitle>
                </SheetHeader>
              </div>
              
              {/* Action Buttons - Top Right */}
              <div className="flex gap-2">
                {/* Download PDF - Show after deposit paid */}
                {['DEPOSIT_PAID', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'DISPATCHED', 'CLOSED'].includes(order.state) && (
                  <Button 
                    onClick={handleDownloadPDF} 
                    size="sm"
                    variant="outline"
                    className="border-2"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
                
                {/* Start Production - Show when deposit paid */}
                {order.state === 'DEPOSIT_PAID' && (
                  <Button 
                    onClick={handleConvertToProduction} 
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Hammer className="w-4 h-4 mr-2" />
                    Start Production
                  </Button>
                )}

                {/* Record Payment */}
                {Number(order.balance_due) > 0 && (
                  <Button 
                    onClick={() => setShowPaymentModal(true)} 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}

                {/* State Transitions */}
                {getAvailableTransitions().map((transition) => (
                  <Button
                    key={transition.state}
                    onClick={() => handleTransitionState(transition.state)}
                    variant={transition.variant}
                    size="sm"
                  >
                    {transition.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Order Header */}
            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{order.reference}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Client Information */}
            {order.client && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client Information
                </h4>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">
                      {order.client.nickname 
                        ? `${order.client.full_name} (${order.client.nickname})`
                        : order.client.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="font-medium">{order.client.phone}</span>
                  </div>
                  {order.client.gender && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gender:</span>
                      <span className="font-medium capitalize">{order.client.gender}</span>
                    </div>
                  )}
                  {order.client.address && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Address:</span>
                      <span className="font-medium text-right max-w-[300px]">{order.client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Summary
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs text-blue-600 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-blue-900">${Number(order.total_amount || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                  <p className="text-xs text-green-600 mb-1">Paid</p>
                  <p className="text-lg font-bold text-green-900">${(order.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                  <p className="text-xs text-orange-600 mb-1">Balance Due</p>
                  <p className="text-lg font-bold text-orange-900">${Number(order.balance_due || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Order Items ({order.items.length})
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex gap-4 p-4">
                        {/* Image Section */}
                        <div className="flex-shrink-0">
                          {item.design_image_url ? (
                            <img
                              src={item.design_image_url}
                              alt={item.description}
                              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                              <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Details Section */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">{item.description}</h5>
                            {item.sku && (
                              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dimensions:</span>
                              <span className="font-medium">{item.width} × {item.height} {item.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Area:</span>
                              <span className="font-medium">{Number(item.area || 0).toFixed(2)} m²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price/unit:</span>
                              <span className="font-medium">${Number(item.planned_price || 0).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm text-gray-600">Item Total:</span>
                            <span className="text-lg font-bold text-[#FF8A50]">
                              ${(Number(item.planned_price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Footer */}
                  <div className="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Order Total:</span>
                      <span className="text-2xl font-bold text-[#FF8A50]">
                        ${Number(order.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment History ({order.payments.length})
                </h4>
                <div className="space-y-2">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="rounded-lg border p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">${Number(payment.amount || 0).toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {payment.type === 'deposit' ? 'Deposit' : 'Balance'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {formatDate(payment.paid_at)} · {payment.method.replace('_', ' ')}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-gray-500 mt-1">Ref: {payment.reference}</p>
                          )}
                          {payment.journal_entry && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                JE: {payment.journal_entry.reference}
                              </Badge>
                              <Link href="/admin/accounting/journal-entries">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accounting Integration */}
            {order.journal_entries && order.journal_entries.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Accounting Entries ({order.journal_entries.length})
                </h4>
                <div className="rounded-lg border p-4 space-y-3">
                  {order.journal_entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium font-mono text-sm">{entry.reference}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                          <Badge 
                            variant={entry.status === 'POSTED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                      <Link href="/admin/accounting/journal-entries">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Entry
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Notes
                </h4>
                <div className="rounded-lg bg-gray-50 border p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              </div>
            )}


          </div>
        </SheetContent>
      </Sheet>

      <RecordPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderId={order.id}
        balanceDue={order.balance_due}
        onSuccess={handlePaymentSuccess}
      />

      {order.items && (
        <StartProductionModal
          open={showProductionModal}
          onClose={() => setShowProductionModal(false)}
          orderId={order.id}
          orderReference={order.reference}
          items={order.items}
          onSuccess={handleProductionSuccess}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
      />
    </>
  );
}

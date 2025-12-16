import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import { formatDate } from '@/lib/utils';
import { ClientModal } from '@/components/modals/ClientModal';
import axios from 'axios';
import { Link } from '@inertiajs/react';

interface Client {
  id: number;
  phone: string;
  full_name: string | null;
  nickname: string | null;
  display_name: string;
  address: string | null;
  gender: 'male' | 'female' | 'other' | null;
  notes: string | null;
  orders_count?: number;
  total_spent?: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  reference: string;
  state: string;
  total_amount: number;
  balance_due: number;
  created_at: string;
}

interface ClientDetailDrawerProps {
  clientId: number | null;
  open: boolean;
  onClose: () => void;
  onClientUpdated?: () => void;
  onClientDeleted?: () => void;
}

export function ClientDetailDrawer({ clientId, open, onClose, onClientUpdated, onClientDeleted }: ClientDetailDrawerProps) {
  const dispatch = useAppDispatch();
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (open && clientId) {
      fetchClientDetails();
    }
  }, [open, clientId]);

  const fetchClientDetails = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/admin/clients/${clientId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      setClient(response.data.data);
      
      // Fetch client orders
      const ordersResponse = await axios.get(`/admin/orders?client_id=${clientId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      setOrders(ordersResponse.data.data || []);
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to load client details',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm(`Are you sure you want to delete ${client.display_name}?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/clients/${client.id}`);
      dispatch(showNotification({
        type: 'success',
        message: 'Client deleted successfully',
      }));
      onClientDeleted?.();
      onClose();
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete client',
      }));
    }
  };

  const handleEditSuccess = () => {
    fetchClientDetails();
    onClientUpdated?.();
  };

  if (!client && !loading) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-[50vw] overflow-y-auto p-8">
          <SheetHeader>
            <SheetTitle className="text-2xl">Client Details</SheetTitle>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF8A50]"></div>
            </div>
          ) : client ? (
            <div className="mt-6 space-y-6">
              {/* Client Info Card */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{client.display_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Customer since {formatDate(client.created_at)}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">Active</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{client.phone}</p>
                  </div>
                  
                  {client.full_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-base text-gray-900 mt-1">{client.full_name}</p>
                    </div>
                  )}

                  {client.nickname && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nickname</p>
                      <p className="text-base text-gray-900 mt-1">{client.nickname}</p>
                    </div>
                  )}

                  {client.gender && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-base text-gray-900 mt-1 capitalize">{client.gender}</p>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-600">Address</p>
                      <p className="text-base text-gray-900 mt-1">{client.address}</p>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-sm text-gray-700 mt-1">{client.notes}</p>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{client.orders_count || 0}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ${(client.total_spent || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Orders History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Order History</h4>
                  <Link href="/admin/orders">
                    <Button size="sm" variant="outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Order
                    </Button>
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link 
                        key={order.id} 
                        href={`/admin/orders/${order.id}`}
                        className="block"
                      >
                        <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-[#FF8A50] hover:bg-orange-50 transition-all cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-mono font-medium text-gray-900">{order.reference}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">${Number(order.total_amount || 0).toFixed(2)}</p>
                              {Number(order.balance_due || 0) > 0 && (
                                <p className="text-sm text-yellow-600 font-medium">
                                  ${Number(order.balance_due || 0).toFixed(2)} due
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowEditModal(true)} 
                  className="flex-1 bg-[#FF8A50] hover:bg-[#FF9B71]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Client
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Edit Modal */}
      {client && (
        <ClientModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          client={client}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

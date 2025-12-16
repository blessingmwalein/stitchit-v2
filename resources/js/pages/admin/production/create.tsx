import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Search, Package, User } from 'lucide-react';
import { OrderStateBadge } from '@/components/ui/badge';

interface OrderItem {
  id: number;
  description: string;
  width: number;
  height: number;
  quantity: number;
  price_per_item: number;
  productionJob?: any;
}

interface Order {
  id: number;
  reference: string;
  state: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
}

interface Props {
  orders: Order[];
}

export default function ProductionCreate({ orders }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter(order => 
      order.reference.toLowerCase().includes(query) ||
      order.client.name.toLowerCase().includes(query) ||
      order.client.email.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const selectedOrder = filteredOrders.find(o => o.id.toString() === selectedOrderId);
  const availableItems = selectedOrder?.items.filter(item => !item.productionJob) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      alert('Please select an order item');
      return;
    }

    setSubmitting(true);

    router.post('/admin/production', {
      order_item_id: parseInt(selectedItemId),
      planned_start_date: plannedStartDate || null,
      planned_end_date: plannedEndDate || null,
      notes: notes || null,
    }, {
      preserveScroll: true,
      onFinish: () => setSubmitting(false),
    });
  };

  const handleConvertOrder = (orderId: number) => {
    if (confirm('Convert all items from this order to production jobs?')) {
      setSubmitting(true);
      router.post(`/admin/orders/${orderId}/convert-to-production`, {}, {
        preserveScroll: true,
        onFinish: () => setSubmitting(false),
      });
    }
  };

  return (
    <AppLayout>
      <Head title="Create Production Job" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.visit('/admin/production')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Production
            </Button>
            <h2 className="text-3xl font-bold text-foreground">Create Production Job</h2>
            <p className="text-muted-foreground mt-1">
              Create a new production job from an approved order
            </p>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.noData}
              title="No orders available"
              description="There are no approved orders ready for production. Orders must be approved or have deposit paid before they can be converted to production jobs."
              action={{
                label: 'View Orders',
                onClick: () => router.visit('/admin/orders'),
              }}
            />
          ) : (
            <div className="grid gap-6">
              {/* Search Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Search Orders</CardTitle>
                  <CardDescription>
                    Find orders by reference number, client name, or email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by order reference, client name, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {searchQuery && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Found {filteredOrders.length} order(s)
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Convert Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Convert</CardTitle>
                  <CardDescription>
                    Convert all items from an order to production jobs at once
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No orders match your search</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-medium">{order.reference}</span>
                            <OrderStateBadge state={order.state} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{order.client.name}</span>
                            <span>•</span>
                            <Package className="h-3 w-3" />
                            <span>{order.items.length} item(s)</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleConvertOrder(order.id)}
                          disabled={submitting}
                        >
                          Convert All
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Manual Create Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Individual Job</CardTitle>
                  <CardDescription>
                    Create a production job for a specific order item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="order">Select Order</Label>
                      <Select
                        value={selectedOrderId}
                        onValueChange={(value) => {
                          setSelectedOrderId(value);
                          setSelectedItemId('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an order" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{order.reference}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{order.client.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filteredOrders.length === 0 && searchQuery && (
                        <p className="text-sm text-muted-foreground mt-2">
                          No orders match your search. Clear the search to see all orders.
                        </p>
                      )}
                    </div>

                    {selectedOrder && (
                      <div>
                        <Label htmlFor="item">Select Order Item</Label>
                        <Select
                          value={selectedItemId}
                          onValueChange={setSelectedItemId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an item" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.description} ({item.width}×{item.height} cm) - Qty: {item.quantity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {availableItems.length === 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            All items from this order already have production jobs
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start">Planned Start Date</Label>
                        <DatePicker
                          date={plannedStartDate}
                          onDateChange={setPlannedStartDate}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end">Planned End Date</Label>
                        <DatePicker
                          date={plannedEndDate}
                          onDateChange={setPlannedEndDate}
                          placeholder="Select end date"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add any production notes..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit('/admin/production')}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!selectedItemId || submitting}>
                        {submitting ? 'Creating...' : 'Create Production Job'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

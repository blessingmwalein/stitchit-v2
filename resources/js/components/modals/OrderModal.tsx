import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Client {
  id: number;
  display_name: string;
  phone: string;
}

interface OrderItem {
  id: string;
  description: string;
  width: number;
  height: number;
  unit: string;
  quantity: number;
  planned_price: number;
  area_sqm: number;
  total_price: number;
  design_image?: File | null;
  design_image_preview?: string;
  existing_image_path?: string;
}

interface Order {
  id: number;
  client_id: number;
  client?: {
    id: number;
    display_name?: string;
    full_name?: string;
    nickname?: string;
    phone: string;
  };
  items?: Array<{
    id: number;
    description: string;
    width: string;
    height: string;
    unit: string;
    quantity: number;
    planned_price: string;
    design_image_path?: string;
    design_image_url?: string;
  }>;
  notes?: string;
  delivery_address?: string;
  delivery_contact?: string;
  state: string;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  preselectedClientId?: number;
  order?: Order | null;
  onSuccess?: () => void;
}

export function OrderModal({ open, onClose, preselectedClientId, order, onSuccess }: OrderModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: Date.now().toString(),
      description: '',
      width: 0,
      height: 0,
      unit: 'cm',
      quantity: 1,
      planned_price: 0,
      area_sqm: 0,
      total_price: 0,
      design_image: null,
      design_image_preview: undefined,
    },
  ]);

  useEffect(() => {
    if (open) {
      if (order) {
        // Edit mode - prefill with existing order data
        setStep(2);
        if (order.client) {
          setSelectedClient({
            id: order.client.id,
            display_name: order.client.display_name || order.client.full_name || order.client.nickname || 'Unknown',
            phone: order.client.phone,
          });
        }
        
        if (order.items && order.items.length > 0) {
          setOrderItems(order.items.map(item => ({
            id: item.id.toString(),
            description: item.description,
            width: parseFloat(item.width),
            height: parseFloat(item.height),
            unit: item.unit,
            quantity: item.quantity,
            planned_price: parseFloat(item.planned_price),
            area_sqm: 0, // Will be recalculated
            total_price: 0, // Will be recalculated
            design_image: null,
            design_image_preview: item.design_image_url,
            existing_image_path: item.design_image_path,
          })));
        }
      } else {
        // Create mode - reset form
        setStep(1);
        setSelectedClient(null);
        setOrderItems([
          {
            id: Date.now().toString(),
            description: '',
            width: 0,
            height: 0,
            unit: 'cm',
            quantity: 1,
            planned_price: 0,
            area_sqm: 0,
            total_price: 0,
            design_image: null,
            design_image_preview: undefined,
          },
        ]);
      }
      
      setErrors({});
      
      if (preselectedClientId && !order) {
        fetchClient(preselectedClientId);
      } else if (!order) {
        fetchClients();
      }
    }
  }, [open, preselectedClientId, order]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/admin/clients/search', {
        params: { q: searchQuery },
      });
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch clients', error);
    }
  };

  const fetchClient = async (clientId: number) => {
    try {
      const response = await axios.get(`/admin/clients/${clientId}`);
      setSelectedClient(response.data.data);
      setStep(2);
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to load client',
      }));
    }
  };

  useEffect(() => {
    if (searchQuery && !preselectedClientId) {
      const timer = setTimeout(() => {
        fetchClients();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const calculateItemTotals = (item: Partial<OrderItem>): Partial<OrderItem> => {
    const width = item.width || 0;
    const height = item.height || 0;
    const quantity = item.quantity || 1;
    const plannedPrice = item.planned_price || 0;
    const unit = item.unit || 'cm';

    let area_sqm = 0;
    if (unit === 'cm') {
      area_sqm = (width * height) / 10000;
    } else if (unit === 'm') {
      area_sqm = width * height;
    } else if (unit === 'in') {
      area_sqm = (width * height) / 1550;
    } else if (unit === 'ft') {
      area_sqm = (width * height) / 10.764;
    }

    const total_price = area_sqm * quantity * plannedPrice;

    return {
      ...item,
      area_sqm: Number(area_sqm.toFixed(4)),
      total_price: Number(total_price.toFixed(2)),
    };
  };

  const handleItemChange = (itemId: string, field: keyof OrderItem, value: string | number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          return calculateItemTotals(updated) as OrderItem;
        }
        return item;
      })
    );
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: '',
        width: 0,
        height: 0,
        unit: 'cm',
        quantity: 1,
        planned_price: 0,
        area_sqm: 0,
        total_price: 0,
        design_image: null,
        design_image_preview: undefined,
      },
    ]);
  };

  const removeOrderItem = (itemId: string) => {
    if (orderItems.length > 1) {
      setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const handleImageUpload = (itemId: string, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrderItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                design_image: file,
                design_image_preview: reader.result as string,
                existing_image_path: undefined, // Clear existing image when uploading new one
              };
            }
            return item;
          })
        );
      };
      reader.readAsDataURL(file);
    } else {
      setOrderItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              design_image: null,
              design_image_preview: undefined,
              existing_image_path: undefined, // Clear existing image when removing
            };
          }
          return item;
        })
      );
    }
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const validateStep1 = () => {
    if (!selectedClient) {
      setErrors({ client: 'Please select a client' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    orderItems.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description is required';
      }
      if (item.width <= 0) {
        newErrors[`item_${index}_width`] = 'Width must be greater than 0';
      }
      if (item.height <= 0) {
        newErrors[`item_${index}_height`] = 'Height must be greater than 0';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.planned_price <= 0) {
        newErrors[`item_${index}_unit_price`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }

    // Check if order is in production or later states
    if (order && ['IN_PRODUCTION', 'READY_FOR_DISPATCH', 'DISPATCHED', 'CLOSED', 'ARCHIVED'].includes(order.state)) {
      dispatch(showNotification({
        type: 'error',
        message: 'Cannot edit orders that are in production or later stages',
      }));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      if (!order) {
        // Only set client_id for new orders
        formData.append('client_id', selectedClient?.id?.toString() || '');
      }

      orderItems.forEach((item, index) => {
        formData.append(`items[${index}][description]`, item.description);
        formData.append(`items[${index}][width]`, item.width.toString());
        formData.append(`items[${index}][height]`, item.height.toString());
        formData.append(`items[${index}][unit]`, item.unit);
        formData.append(`items[${index}][quantity]`, item.quantity.toString());
        formData.append(`items[${index}][planned_price]`, item.planned_price.toString());
        
        // Include existing image path if no new image uploaded
        if (item.existing_image_path && !item.design_image) {
          formData.append(`items[${index}][existing_image_path]`, item.existing_image_path);
        }
        
        if (item.design_image) {
          formData.append(`items[${index}][design_image]`, item.design_image);
        }
      });

      if (order) {
        // Update existing order
        formData.append('_method', 'PUT');
        await axios.post(`/admin/orders/${order.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        dispatch(showNotification({
          type: 'success',
          message: 'Order updated successfully',
        }));
      } else {
        // Create new order
        await axios.post('/admin/orders', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        dispatch(showNotification({
          type: 'success',
          message: 'Order created successfully',
        }));
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      dispatch(showNotification({
        type: 'error',
        message: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {order ? 'Edit Order' : 'Create New Order'}
            {!order && (
              <Badge variant="outline" className="ml-2">
                Step {step} of 2
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Client */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!preselectedClientId}
              />
              {errors.client && <p className="text-sm text-red-600">{errors.client}</p>}
            </div>

            {selectedClient ? (
              <div className="rounded-lg border-2 border-[#FF8A50] bg-orange-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedClient.display_name}</p>
                    <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                  </div>
                  {!preselectedClientId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(null);
                        setSearchQuery('');
                      }}
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-[#FF8A50] hover:bg-orange-50 transition-all"
                  >
                    <p className="font-medium text-gray-900">{client.display_name}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </div>
                ))}
                {searchQuery && clients.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No clients found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Order Items */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-semibold text-gray-900">{selectedClient?.display_name}</p>
            </div>

            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Item {index + 1}</Label>
                    {orderItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${item.id}`}>Description *</Label>
                    <Input
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="e.g., Custom tufted rug with floral pattern"
                    />
                    {errors[`item_${index}_description`] && (
                      <p className="text-sm text-red-600">{errors[`item_${index}_description`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`width-${item.id}`}>Width *</Label>
                      <Input
                        id={`width-${item.id}`}
                        type="number"
                        value={item.width || ''}
                        onChange={(e) => handleItemChange(item.id, 'width', Number(e.target.value))}
                        placeholder="100"
                      />
                      {errors[`item_${index}_width`] && (
                        <p className="text-sm text-red-600">{errors[`item_${index}_width`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`height-${item.id}`}>Height *</Label>
                      <Input
                        id={`height-${item.id}`}
                        type="number"
                        value={item.height || ''}
                        onChange={(e) => handleItemChange(item.id, 'height', Number(e.target.value))}
                        placeholder="150"
                      />
                      {errors[`item_${index}_height`] && (
                        <p className="text-sm text-red-600">{errors[`item_${index}_height`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`unit-${item.id}`}>Unit *</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                      >
                        <SelectTrigger id={`unit-${item.id}`}>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                          <SelectItem value="cm">Centimeters(cm)</SelectItem>
                          <SelectItem value="m">Metres (m)</SelectItem>
                          <SelectItem value="in">Inches(in)</SelectItem>
                          <SelectItem value="ft">Feet(ft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        min="1"
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`planned_price-${item.id}`}>Price per m² ($) *</Label>
                      <Input
                        id={`planned_price-${item.id}`}
                        type="number"
                        step="0.01"
                        value={item.planned_price || ''}
                        onChange={(e) => handleItemChange(item.id, 'planned_price', Number(e.target.value))}
                        placeholder="50.00"
                      />
                      {errors[`item_${index}_unit_price`] && (
                        <p className="text-sm text-red-600">{errors[`item_${index}_unit_price`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Design Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor={`design-image-${item.id}`}>
                      Rug Design Image (Optional)
                    </Label>
                    {item.design_image_preview ? (
                      <div className="relative rounded-lg border-2 border-gray-200 p-2">
                        <img
                          src={item.design_image_preview}
                          alt="Design preview"
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageUpload(item.id, null)}
                          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`design-image-${item.id}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#FF8A50] hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB</p>
                        </div>
                        <input
                          id={`design-image-${item.id}`}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                dispatch(showNotification({
                                  type: 'error',
                                  message: 'Image size must be less than 10MB',
                                }));
                                return;
                              }
                              handleImageUpload(item.id, file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Area: {item.area_sqm} m²</span>
                    <span className="font-semibold text-gray-900">Total: ${item.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addOrderItem}
                className="w-full border-dashed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Item
              </Button>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-[#FF8A50] to-[#FF9B71] text-white p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Order Total</span>
                <span className="text-2xl font-bold">${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? onClose : (order ? onClose : handleBack)}
              disabled={loading}
            >
              {step === 1 || order ? 'Cancel' : 'Back'}
            </Button>
            <Button
              type="button"
              onClick={step === 1 ? handleNext : handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-[#FF8A50] to-[#FF9B71] hover:scale-105 transition-transform"
            >
              {loading ? (order ? 'Updating...' : 'Creating...') : step === 1 ? 'Next' : (order ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

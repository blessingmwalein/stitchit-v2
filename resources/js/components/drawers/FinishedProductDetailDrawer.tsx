import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  User,
} from 'lucide-react';
import axios from 'axios';
import { formatDate } from '@/lib/utils';
import { EditFinishedProductModal } from '@/components/modals/EditFinishedProductModal';

interface FinishedProduct {
  id: number;
  reference: string;
  product_name: string;
  description?: string;
  quality_status: string;
  quality_notes?: string;
  storage_location?: string;
  status: string;
  use_case?: string;
  primary_image?: string;
  images?: string[];
  is_published: boolean;
  published_at?: string;
  notes?: string;
  created_at: string;
  cost_price?: number;
  selling_price?: number;
  order?: {
    id: number;
    reference: string;
    client: {
      id: number;
      full_name: string;
    };
  };
  production_job?: {
    id: number;
    reference: string;
  };
}

interface FinishedProductDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  productId: number | null;
}

export function FinishedProductDetailDrawer({
  open,
  onClose,
  productId,
}: FinishedProductDetailDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<FinishedProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (open && productId) {
      fetchProductDetails();
    }
  }, [open, productId]);

  const fetchProductDetails = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/admin/finished-products/${productId}`);
      setProduct(response.data.data);
      if (response.data.data.primary_image) {
        setSelectedImage(response.data.data.primary_image);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!product) return;

    try {
      await axios.post(`/admin/finished-products/${product.id}/publish`);
      await fetchProductDetails();
      toast({
        title: 'Success',
        description: product.is_published ? 'Product unpublished' : 'Product published',
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

  const getQualityBadge = (status: string) => {
    const config = {
      PASSED: { variant: 'default' as const, icon: CheckCircle },
      FAILED: { variant: 'destructive' as const, icon: AlertCircle },
      NEEDS_REWORK: { variant: 'secondary' as const, icon: AlertCircle },
    };
    const { variant, icon: Icon } = config[status as keyof typeof config] || config.PASSED;
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      IN_STOCK: 'default',
      RESERVED: 'secondary',
      DELIVERED: 'outline',
      SOLD: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-6">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl">{product.product_name}</SheetTitle>
                <SheetDescription>{product.reference}</SheetDescription>
              </div>
              <div className="flex gap-2">
                {product.is_published ? (
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    Draft
                  </Badge>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6 pb-6">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Product
              </Button>
              <Button
                variant={product.is_published ? 'secondary' : 'default'}
                onClick={handleTogglePublish}
                className="gap-2"
              >
                {product.is_published ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
            </div>

            <Separator />

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="related">Related Info</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Description */}
                {product.description && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h4>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                )}

                {/* Status & Quality */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Quality Status</h4>
                    <div className="space-y-2">
                      <div>
                        {getQualityBadge(product.quality_status)}
                      </div>
                      {product.quality_notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{product.quality_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Product Status</h4>
                    <div className="space-y-2">
                      <div>
                        {getStatusBadge(product.status)}
                      </div>
                      {product.use_case && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Use Case</p>
                          <Badge variant="outline">{product.use_case}</Badge>
                        </div>
                      )}
                      {product.storage_location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {product.storage_location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                {(product.cost_price || product.selling_price) && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Pricing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {product.cost_price && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Cost Price</p>
                          <p className="text-lg font-semibold">${Number(product.cost_price).toFixed(2)}</p>
                        </div>
                      )}
                      {product.selling_price && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Selling Price</p>
                          <p className="text-lg font-semibold text-green-600">${Number(product.selling_price).toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {product.notes && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.notes}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-semibold mb-3 text-xs uppercase text-muted-foreground">Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(product.created_at)}</span>
                    </div>
                    {product.published_at && (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Published:</span>
                        <span>{formatDate(product.published_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-6">
                {/* Main Image Display */}
                {selectedImage && (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedImage}
                      alt={product.product_name}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                )}

                {/* Image Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {product.primary_image && (
                    <button
                      onClick={() => setSelectedImage(product.primary_image!)}
                      className={`border-2 rounded-lg overflow-hidden aspect-square ${
                        selectedImage === product.primary_image ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={product.primary_image}
                        alt="Primary"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  {product.images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`border-2 rounded-lg overflow-hidden aspect-square ${
                        selectedImage === image ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {!product.primary_image && (!product.images || product.images.length === 0) && (
                  <div className="text-center py-12 border rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No images available</p>
                  </div>
                )}
              </TabsContent>

              {/* Related Info Tab */}
              <TabsContent value="related" className="space-y-4 mt-6">
                {product.order && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Order Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Reference:</span>
                        <span className="font-medium">{product.order.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client:</span>
                        <span className="font-medium">{product.order.client.full_name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {product.production_job && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Production Job
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Reference:</span>
                        <span className="font-medium">{product.production_job.reference}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!product.order && !product.production_job && (
                  <div className="text-center py-12 border rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No related information available</p>
                    <p className="text-xs text-muted-foreground mt-1">This is a standalone product</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Modal */}
      {product && (
        <EditFinishedProductModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            fetchProductDetails();
          }}
          product={product}
        />
      )}
    </>
  );
}

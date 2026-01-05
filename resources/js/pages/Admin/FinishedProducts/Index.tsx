import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Grid3x3,
  List,
  Search,
  Package,
  Eye,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateStandaloneFinishedProductModal } from '@/components/modals/CreateStandaloneFinishedProductModal';
import { FinishedProductDetailDrawer } from '@/components/drawers/FinishedProductDetailDrawer';

interface FinishedProduct {
  id: number;
  reference: string;
  product_name: string;
  description?: string;
  quality_status: string;
  status: string;
  storage_location?: string;
  use_case?: string;
  primary_image?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  order?: {
    reference: string;
    client: {
      full_name: string;
    };
  };
}

interface Props {
  products: {
    data: FinishedProduct[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    status?: string;
    quality_status?: string;
    is_published?: string;
    use_case?: string;
    search?: string;
  };
}

export default function FinishedProductsIndex({ products, filters }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [qualityFilter, setQualityFilter] = useState(filters.quality_status || 'all');
  const [publishedFilter, setPublishedFilter] = useState(filters.is_published || 'all');
  const [useCaseFilter, setUseCaseFilter] = useState(filters.use_case || 'all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  const handleSearch = () => {
    router.get('/admin/finished-products', {
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      quality_status: qualityFilter !== 'all' ? qualityFilter : undefined,
      is_published: publishedFilter !== 'all' ? publishedFilter : undefined,
      use_case: useCaseFilter !== 'all' ? useCaseFilter : undefined,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
    setShowDetailDrawer(true);
  };

  const getQualityBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      'PASSED': 'default',
      'FAILED': 'destructive',
      'NEEDS_REWORK': 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      'IN_STOCK': 'default',
      'RESERVED': 'secondary',
      'DELIVERED': 'outline',
      'SOLD': 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <Head title="Finished Products" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finished Products</h1>
            <p className="text-muted-foreground">
              Manage and view completed production items
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Finished Product
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="NEEDS_REWORK">Needs Rework</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="1">Published</SelectItem>
                  <SelectItem value="0">Unpublished</SelectItem>
                </SelectContent>
              </Select>
              <Select value={useCaseFilter} onValueChange={setUseCaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Use Case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Use Cases</SelectItem>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {products.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Finished Products</h3>
              <p className="text-sm text-muted-foreground">
                Finished products will appear here once production jobs are completed
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.data.map((product) => (
              <Card 
                key={product.id} 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
                onClick={() => handleViewProduct(product.id)}
              >
                {/* Product Image */}
                {product.primary_image ? (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={product.primary_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground opacity-30" />
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.product_name}</h3>
                        <p className="text-xs text-muted-foreground">{product.reference}</p>
                      </div>
                      {product.is_published && (
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      )}
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      {getQualityBadge(product.quality_status)}
                      {getStatusBadge(product.status)}
                    </div>

                    {product.storage_location && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {product.storage_location}
                      </div>
                    )}

                    {product.order && (
                      <div className="text-xs text-muted-foreground">
                        <div>Order: {product.order.reference}</div>
                        <div>Client: {product.order.client.full_name}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {products.data.map((product) => (
                  <div 
                    key={product.id} 
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      {product.primary_image ? (
                        <img
                          src={product.primary_image}
                          alt={product.product_name}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-8 w-8 text-muted-foreground opacity-30" />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{product.product_name}</h3>
                            <p className="text-sm text-muted-foreground">{product.reference}</p>
                          </div>
                          <div className="flex gap-2">
                            {product.is_published && (
                              <Badge variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            )}
                          </div>
                        </div>

                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getQualityBadge(product.quality_status)}
                            {getStatusBadge(product.status)}
                          </div>

                          {product.storage_location && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {product.storage_location}
                            </div>
                          )}

                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(product.created_at)}
                          </div>
                        </div>

                        {product.order && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Order: {product.order.reference} • Client: {product.order.client.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {products.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {products.data.length} of {products.total} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={products.current_page === 1}
                onClick={() => router.get(`/admin/finished-products?page=${products.current_page - 1}`)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={products.current_page === products.last_page}
                onClick={() => router.get(`/admin/finished-products?page=${products.current_page + 1}`)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Standalone Product Modal */}
      <CreateStandaloneFinishedProductModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Product Detail Drawer */}
      <FinishedProductDetailDrawer
        open={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
      />
    </AppLayout>
  );
}

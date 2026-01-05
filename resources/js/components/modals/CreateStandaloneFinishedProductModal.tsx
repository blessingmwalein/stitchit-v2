import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface CreateStandaloneFinishedProductModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateStandaloneFinishedProductModal({
  open,
  onClose,
}: CreateStandaloneFinishedProductModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quality_status: 'PASSED',
    quality_notes: '',
    storage_location: '',
    status: 'IN_STOCK',
    use_case: undefined as string | undefined,
    notes: '',
    is_published: true,
  });
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrimaryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + additionalImages.length > 5) {
      toast({
        title: 'Too many images',
        description: 'You can only upload up to 5 additional images',
        variant: 'destructive',
      });
      return;
    }

    setAdditionalImages([...additionalImages, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!primaryImage) {
      toast({
        title: 'Primary image required',
        description: 'Please upload a primary image for the product',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('product_name', formData.product_name);
      data.append('description', formData.description);
      data.append('quality_status', formData.quality_status);
      data.append('quality_notes', formData.quality_notes);
      data.append('storage_location', formData.storage_location);
      data.append('status', formData.status);
      if (formData.use_case) {
        data.append('use_case', formData.use_case);
      }
      data.append('notes', formData.notes);
      data.append('is_published', formData.is_published ? '1' : '0');
      data.append('primary_image', primaryImage);

      additionalImages.forEach((image, index) => {
        data.append(`additional_images[${index}]`, image);
      });

      await axios.post('/admin/finished-products/standalone', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: 'Finished product created successfully',
      });

      router.reload();
      onClose();
    } catch (error: any) {
      console.error('Error creating finished product:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create finished product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        product_name: '',
        description: '',
        quality_status: 'PASSED',
        quality_notes: '',
        storage_location: '',
        status: 'IN_STOCK',
        use_case: undefined,
        notes: '',
        is_published: true,
      });
      setPrimaryImage(null);
      setPrimaryImagePreview('');
      setAdditionalImages([]);
      setAdditionalImagePreviews([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Create Finished Product</DialogTitle>
          <DialogDescription>
            Add a previously completed product to the inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              placeholder="e.g., Persian Rug - Red & Gold"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the product details..."
              rows={3}
            />
          </div>

          {/* Primary Image */}
          <div>
            <Label htmlFor="primary_image">Primary Image *</Label>
            <div className="mt-2">
              {primaryImagePreview ? (
                <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                  <img
                    src={primaryImagePreview}
                    alt="Primary preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPrimaryImage(null);
                      setPrimaryImagePreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> primary image
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    id="primary_image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePrimaryImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <Label>Additional Images (Optional - Max 5)</Label>
            <div className="mt-2 space-y-2">
              {additionalImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {additionalImages.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Add more images</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Quality Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quality_status">Quality Status *</Label>
              <Select
                value={formData.quality_status}
                onValueChange={(value) => setFormData({ ...formData, quality_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="NEEDS_REWORK">Needs Rework</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Use Case */}
          <div>
            <Label htmlFor="use_case">Use Case (Optional)</Label>
            <Select
              value={formData.use_case || undefined}
              onValueChange={(value) => setFormData({ ...formData, use_case: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select use case" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                <SelectItem value="Modern">Modern</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
                <SelectItem value="School">School</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Notes */}
          <div>
            <Label htmlFor="quality_notes">Quality Notes</Label>
            <Textarea
              id="quality_notes"
              value={formData.quality_notes}
              onChange={(e) => setFormData({ ...formData, quality_notes: e.target.value })}
              placeholder="Any notes about quality..."
              rows={2}
            />
          </div>

          {/* Storage Location */}
          <div>
            <Label htmlFor="storage_location">Storage Location</Label>
            <Input
              id="storage_location"
              value={formData.storage_location}
              onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
              placeholder="e.g., Warehouse A, Shelf 3"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              Publish immediately (make visible to clients)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

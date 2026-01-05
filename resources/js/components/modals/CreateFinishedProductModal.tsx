import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
  jobId: number;
  jobReference: string;
  onSuccess: () => void;
}

export function CreateFinishedProductModal({ open, onClose, jobId, jobReference, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quality_status: 'PASSED',
    quality_notes: '',
    storage_location: '',
    notes: '',
    is_published: false,
  });

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
    if (files.length > 0) {
      setAdditionalImages((prev) => [...prev, ...files]);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!primaryImage) {
      toast({
        title: 'Error',
        description: 'Please upload a primary image',
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
      data.append('notes', formData.notes);
      data.append('is_published', formData.is_published ? '1' : '0');
      
      if (primaryImage) {
        data.append('primary_image', primaryImage);
      }
      
      additionalImages.forEach((image, index) => {
        data.append(`images[${index}]`, image);
      });

      await axios.post(`/admin/production/${jobId}/finished-product`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: 'Finished product created successfully',
      });

      onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Finished Product</DialogTitle>
          <DialogDescription>
            Create a finished product entry for job {jobReference}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              placeholder="e.g., Custom Tufted Rug - Blue"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the finished product..."
              rows={3}
            />
          </div>

          {/* Primary Image */}
          <div className="space-y-2">
            <Label>Primary Image *</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {primaryImagePreview ? (
                <div className="relative">
                  <img
                    src={primaryImagePreview}
                    alt="Primary preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPrimaryImage(null);
                      setPrimaryImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload primary image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div className="space-y-2">
            <Label>Additional Images (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              {additionalImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Additional ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
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
              {additionalImagePreviews.length < 5 && (
                <label className="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
                  <ImageIcon className="h-6 w-6 mb-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Quality Status */}
          <div className="space-y-2">
            <Label htmlFor="quality_status">Quality Status *</Label>
            <Select
              value={formData.quality_status}
              onValueChange={(value) => setFormData({ ...formData, quality_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASSED">Passed</SelectItem>
                <SelectItem value="NEEDS_REWORK">Needs Rework</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Notes */}
          <div className="space-y-2">
            <Label htmlFor="quality_notes">Quality Notes</Label>
            <Textarea
              id="quality_notes"
              value={formData.quality_notes}
              onChange={(e) => setFormData({ ...formData, quality_notes: e.target.value })}
              placeholder="Any quality observations or notes..."
              rows={2}
            />
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <Label htmlFor="storage_location">Storage Location</Label>
            <Input
              id="storage_location"
              value={formData.storage_location}
              onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
              placeholder="e.g., Warehouse A - Shelf 3"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {/* Publish to Client */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              Publish to client portal immediately
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Finished Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

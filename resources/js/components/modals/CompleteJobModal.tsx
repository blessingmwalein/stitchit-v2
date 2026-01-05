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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  jobId: number;
  jobReference: string;
  onSuccess: () => void;
}

export function CompleteJobModal({ open, onClose, jobId, jobReference, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quality_status: 'PASSED',
    quality_notes: '',
    storage_location: '',
    status: 'IN_STOCK',
    notes: '',
  });
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('quality_status', formData.quality_status);
      data.append('quality_notes', formData.quality_notes);
      data.append('storage_location', formData.storage_location);
      data.append('status', formData.status);
      data.append('notes', formData.notes);

      images.forEach((image, index) => {
        data.append(`images[${index}]`, image);
      });

      // Create finished product
      await axios.post(`/admin/finished-products/from-job/${jobId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Transition job to completed
      await axios.post(`/admin/production/${jobId}/transition`, {
        state: 'COMPLETED',
      });

      toast({
        title: 'Success',
        description: 'Job completed and finished product created',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error completing job:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Complete Production Job
          </DialogTitle>
          <DialogDescription>
            Complete quality check for job {jobReference} and create finished product
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quality Status */}
          <div className="space-y-2">
            <Label htmlFor="quality_status">Quality Status *</Label>
            <Select
              value={formData.quality_status}
              onValueChange={(value) =>
                setFormData({ ...formData, quality_status: value })
              }
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
              placeholder="Add quality inspection notes..."
              value={formData.quality_notes}
              onChange={(e) =>
                setFormData({ ...formData, quality_notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <Label htmlFor="storage_location">Storage Location</Label>
            <Input
              id="storage_location"
              placeholder="e.g., Warehouse A, Shelf 3"
              value={formData.storage_location}
              onChange={(e) =>
                setFormData({ ...formData, storage_location: e.target.value })
              }
            />
          </div>

          {/* Product Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Product Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('images')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images
                </Button>
                <span className="text-sm text-muted-foreground">
                  {images.length} file(s) selected
                </span>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Completing...' : 'Complete Job & Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

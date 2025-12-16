import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { showNotification } from '@/store/slices/uiSlice';

interface ProductionJob {
  id: number;
  reference: string;
  state: string;
  planned_start_at?: string;
  planned_end_at?: string;
  assigned_to?: {
    id: number;
    name: string;
  };
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  job: ProductionJob | null;
  onSuccess?: () => void;
}

const STATES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'MATERIALS_ALLOCATED', label: 'Materials Allocated' },
  { value: 'TUFTING', label: 'Tufting' },
  { value: 'FINISHING', label: 'Finishing' },
  { value: 'QUALITY_CHECK', label: 'Quality Check' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function EditProductionModal({ open, onClose, job, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const [plannedStartDate, setPlannedStartDate] = useState<Date | undefined>();
  const [plannedEndDate, setPlannedEndDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    state: '',
    assigned_to: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setPlannedStartDate(job.planned_start_at ? new Date(job.planned_start_at) : undefined);
      setPlannedEndDate(job.planned_end_at ? new Date(job.planned_end_at) : undefined);
      setFormData({
        state: job.state || '',
        assigned_to: job.assigned_to?.id?.toString() || '',
        notes: job.notes || '',
      });
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setLoading(true);
    router.put(
      `/admin/production/${job.id}`,
      {
        ...formData,
        planned_start_at: plannedStartDate ? format(plannedStartDate, 'yyyy-MM-dd') : null,
        planned_end_at: plannedEndDate ? format(plannedEndDate, 'yyyy-MM-dd') : null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          dispatch(showNotification({
            type: 'success',
            message: `Production job ${job.reference} updated successfully!`,
            duration: 5000,
          }));
          onClose();
          onSuccess?.();
        },
        onError: (errors) => {
          dispatch(showNotification({
            type: 'error',
            message: 'Failed to update production job. Please try again.',
            duration: 5000,
          }));
        },
        onFinish: () => setLoading(false),
      }
    );
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Production Job</DialogTitle>
          <DialogDescription>
            Update production job details for {job.reference}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* State */}
          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Planned Start Date */}
          <div className="space-y-2">
            <Label htmlFor="planned_start_at">Planned Start Date</Label>
            <DatePicker
              date={plannedStartDate}
              onDateChange={setPlannedStartDate}
              placeholder="Select start date"
            />
          </div>

          {/* Planned End Date */}
          <div className="space-y-2">
            <Label htmlFor="planned_end_at">Planned End Date</Label>
            <DatePicker
              date={plannedEndDate}
              onDateChange={setPlannedEndDate}
              placeholder="Select end date"
            />
          </div>

          {/* Assignment */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned To (User ID)</Label>
            <Input
              id="assigned_to"
              type="number"
              placeholder="Enter user ID"
              value={formData.assigned_to}
              onChange={(e) =>
                setFormData({ ...formData, assigned_to: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to unassign
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this production job..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

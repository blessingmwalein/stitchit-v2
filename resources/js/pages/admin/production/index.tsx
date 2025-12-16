import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductionJobs } from '@/store/slices/productionSlice';
import { DataTable, Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ProductionStateBadge } from '@/components/ui/badge';
import { EmptyState, EmptyIcons } from '@/components/ui/empty-state';
import { ProductionJob } from '@/store/slices/productionSlice';
import { ProductionDetailDrawer } from '@/components/drawers/ProductionDetailDrawer';
import { EditProductionModal } from '@/components/modals/EditProductionModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, LayoutList, KanbanSquare, Package, User, Calendar, Image as ImageIcon, Edit } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

type ViewMode = 'list' | 'grid' | 'kanban';

export default function ProductionIndex() {
  const dispatch = useAppDispatch();
  const { items = [], loading = false, pagination = { current_page: 1, last_page: 1, total: 0, per_page: 15 } } = useAppSelector((state) => state.production);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [editingJob, setEditingJob] = useState<ProductionJob | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    dispatch(fetchProductionJobs({}));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    const params: any = { page };
    if (sortField) {
      params.sort_by = sortField;
      params.sort_direction = sortDirection;
    }
    dispatch(fetchProductionJobs(params));
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    dispatch(fetchProductionJobs({ 
      sort_by: field, 
      sort_direction: newDirection 
    }));
  };

  const handleJobClick = (job: ProductionJob) => {
    setShowDetailDrawer(false);
    setTimeout(() => {
      setSelectedJobId(job.id);
      setShowDetailDrawer(true);
    }, 0);
  };

  const handleEdit = (job: ProductionJob, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingJob(job);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    dispatch(fetchProductionJobs({ page: pagination.current_page }));
  };

  // Calculate stats
  const stats = {
    total: items.length,
    planned: items.filter((j) => j.state === 'PLANNED').length,
    inProgress: items.filter((j) => ['MATERIALS_ALLOCATED', 'TUFTING', 'FINISHING'].includes(j.state)).length,
    completed: items.filter((j) => j.state === 'COMPLETED').length,
  };

  // Group jobs by state for kanban
  const jobsByState = {
    PLANNED: items.filter(j => j.state === 'PLANNED'),
    MATERIALS_ALLOCATED: items.filter(j => j.state === 'MATERIALS_ALLOCATED'),
    TUFTING: items.filter(j => j.state === 'TUFTING'),
    FINISHING: items.filter(j => j.state === 'FINISHING'),
    QUALITY_CHECK: items.filter(j => j.state === 'QUALITY_CHECK'),
    COMPLETED: items.filter(j => j.state === 'COMPLETED'),
  };

  const columns: Column<ProductionJob>[] = [
    {
      header: 'Job #',
      accessor: 'reference',
      className: 'font-mono font-medium',
      sortable: true,
      sortKey: 'reference',
    },
    {
      header: 'Client',
      accessor: (row) => {
        const client = row.order_item?.order?.client;
        if (!client) return '-';
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {client.full_name?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{client.full_name}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Order Item',
      accessor: (row) => row.order_item?.description || '-',
    },
    {
      header: 'State',
      accessor: (row) => <ProductionStateBadge state={row.state} />,
      sortable: true,
      sortKey: 'state',
    },
    {
      header: 'Assigned To',
      accessor: (row) => row.assigned_to?.name || 'Unassigned',
      className: 'text-muted-foreground text-sm',
    },
    {
      header: 'Planned Start',
      accessor: (row) =>
        row.planned_start_at
          ? formatDate(row.planned_start_at)
          : '-',
      className: 'text-sm',
      sortable: true,
      sortKey: 'planned_start_at',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleEdit(row, e)}
          className="h-8 w-8 rounded-full"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      className: 'text-center',
    },
  ];

  return (
    <AppLayout>
      <Head title="Production" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Production</h2>
              <p className="text-muted-foreground mt-1">
                Manage manufacturing jobs and workflows
              </p>
            </div>
            <Link href="/admin/production/create">
              <Button>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Job
              </Button>
            </Link>
          </div>

          {/* Stats - Smaller */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-card border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Jobs</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Planned</div>
              <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">In Progress</div>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <KanbanSquare className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>

          {items.length === 0 && !loading ? (
            <EmptyState
              icon={EmptyIcons.Clipboard}
              title="No production jobs yet"
              description="Create production jobs from approved orders."
              action={{
                label: 'Create Production Job',
                onClick: () => (window.location.href = '/admin/production/create'),
              }}
            />
          ) : (
            <>
              {/* List View */}
              {viewMode === 'list' && (
                <>
                  <DataTable
                    data={items}
                    columns={columns}
                    loading={loading}
                    onRowClick={handleJobClick}
                    sortable={true}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    total={pagination.total}
                    perPage={pagination.per_page}
                    onPageChange={handlePageChange}
                  />
                </>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((job) => {
                    const client = job.order_item?.order?.client;
                    return (
                      <div
                        key={job.id}
                        onClick={() => handleJobClick(job)}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-card relative"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEdit(job, e)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <div>
                            <h3 className="font-mono font-semibold text-sm">{job.reference}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {job.order_item?.order?.reference}
                            </p>
                          </div>
                          <ProductionStateBadge state={job.state} />
                        </div>

                        {job.order_item?.design_image_url && (
                          <div className="w-full h-32 rounded-md overflow-hidden mb-3 bg-muted">
                            <img
                              src={job.order_item.design_image_url}
                              alt="Design"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="space-y-2 text-sm">
                          {client && (
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {client.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs truncate">{client.full_name}</p>
                                <p className="text-xs text-muted-foreground">{client.phone}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-3 w-3" />
                            <span className="truncate">{job.order_item?.description}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{job.assigned_to?.name || 'Unassigned'}</span>
                          </div>
                          {job.planned_start_at && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(job.planned_start_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Kanban View */}
              {viewMode === 'kanban' && (
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-max">
                    {Object.entries(jobsByState).map(([state, jobs]) => (
                      <div key={state} className="w-80 flex-shrink-0">
                        <div className="bg-muted/50 rounded-t-lg p-3 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{state.replace(/_/g, ' ')}</h3>
                            <span className="text-xs bg-background rounded-full px-2 py-1">
                              {jobs.length}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3 p-3 bg-muted/20 rounded-b-lg min-h-[400px]">
                          {jobs.map((job) => {
                            const client = job.order_item?.order?.client;
                            return (
                              <div
                                key={job.id}
                                onClick={() => handleJobClick(job)}
                                className="bg-card border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer relative"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleEdit(job, e)}
                                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 hover:bg-background"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>

                                <div className="flex items-start gap-2 mb-2 pr-8">
                                  {job.order_item?.design_image_url && (
                                    <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                      <img
                                        src={job.order_item.design_image_url}
                                        alt="Design"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-mono font-medium text-xs mb-1">{job.reference}</h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {job.order_item?.description}
                                    </p>
                                  </div>
                                </div>

                                {client && (
                                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                                    <Avatar className="h-7 w-7">
                                      <AvatarFallback className="text-xs">
                                        {client.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-xs truncate">{client.full_name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{client.phone}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Package className="h-3 w-3" />
                                    <span className="truncate">{job.order_item?.order?.reference}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>{job.assigned_to?.name || 'Unassigned'}</span>
                                  </div>
                                  {job.planned_start_at && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(job.planned_start_at)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Production Detail Drawer */}
      <ProductionDetailDrawer
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        jobId={selectedJobId}
      />

      {/* Edit Production Modal */}
      <EditProductionModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        job={editingJob}
        onSuccess={handleEditSuccess}
      />
    </AppLayout>
  );
}

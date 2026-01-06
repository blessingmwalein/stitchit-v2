import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/axios';

export interface ProductionJob {
  id: number;
  order_item_id: number;
  reference: string;
  state: 'PLANNED' | 'MATERIALS_ALLOCATED' | 'TUFTING' | 'FINISHING' | 'QUALITY_CHECK' | 'COMPLETED';
  planned_start_at?: string;
  planned_end_at?: string;
  actual_start_at?: string;
  actual_end_at?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  estimated_material_cost?: number;
  actual_material_cost?: number;
  estimated_labor_hours?: number;
  actual_labor_hours?: number;
  assigned_to?: { id: number; name: string };
  notes?: string;
  created_at: string;
  updated_at: string;
  order_item?: {
    id: number;
    description: string;
    width?: number;
    height?: number;
    quantity?: number;
    price_per_item?: number;
    design_image_url?: string;
    order?: {
      id: number;
      reference: string;
      client?: {
        id: number;
        full_name: string;
        phone: string;
        address?: string;
      };
    };
  };
  bom_lines?: any[];
  material_consumptions?: any[];
  cost_snapshot?: any;
}

interface ProductionState {
  items: ProductionJob[];
  currentJob: ProductionJob | null;
  loading: boolean;
  error: string | null;
  filters: {
    state?: string;
    assigned_to?: number;
    search?: string;
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: ProductionState = {
  items: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
};

// Async thunks
export const fetchProductionJobs = createAsyncThunk(
  'production/fetchJobs',
  async (params: { page?: number; per_page?: number; state?: string; assigned_to?: number; search?: string } = {}) => {
    const response = await api.get('/admin/production', { 
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data;
  }
);

export const fetchProductionJob = createAsyncThunk(
  'production/fetchJob',
  async (id: number) => {
    const response = await api.get(`/admin/production/${id}`);
    return response.data.data;
  }
);

export const createProductionJob = createAsyncThunk(
  'production/createJob',
  async (jobData: any) => {
    const response = await api.post('/admin/production', jobData);
    return response.data.data;
  }
);

export const updateProductionJob = createAsyncThunk(
  'production/updateJob',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await api.put(`/admin/production/${id}`, data);
    return response.data.data;
  }
);

export const transitionJobState = createAsyncThunk(
  'production/transitionState',
  async ({ id, state }: { id: number; state: string }) => {
    const response = await api.post(`/admin/production/${id}/transition`, { state });
    return response.data.data;
  }
);

export const allocateMaterials = createAsyncThunk(
  'production/allocateMaterials',
  async ({ id, materials }: { id: number; materials: any[] }) => {
    const response = await api.post(`/admin/production/${id}/allocate`, { materials });
    return response.data.data;
  }
);

export const recordConsumption = createAsyncThunk(
  'production/recordConsumption',
  async ({ id, consumptionData }: { id: number; consumptionData: any }) => {
    const response = await api.post(`/admin/production/${id}/consume`, consumptionData);
    return response.data.data;
  }
);

export const assignJob = createAsyncThunk(
  'production/assignJob',
  async ({ id, user_id }: { id: number; user_id: number }) => {
    const response = await api.post(`/admin/production/${id}/assign`, { user_id });
    return response.data.data;
  }
);

export const deleteProductionJob = createAsyncThunk(
  'production/deleteJob',
  async (id: number) => {
    await api.delete(`/admin/production/${id}`);
    return id;
  }
);

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchProductionJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductionJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchProductionJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch production jobs';
      })
      // Fetch single job
      .addCase(fetchProductionJob.fulfilled, (state, action) => {
        state.currentJob = action.payload;
      })
      // Create job
      .addCase(createProductionJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update job
      .addCase(updateProductionJob.fulfilled, (state, action) => {
        const index = state.items.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      // Transition state
      .addCase(transitionJobState.fulfilled, (state, action) => {
        const index = state.items.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      // Delete job
      .addCase(deleteProductionJob.fulfilled, (state, action) => {
        state.items = state.items.filter((j) => j.id !== action.payload);
      });
  },
});

export const { clearCurrentJob, setFilters, clearError } = productionSlice.actions;
export default productionSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/axios';

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  type: 'yarn' | 'tufting_cloth' | 'backing_cloth' | 'carpet_tile_vinyl' | 'backing_glue' | 'glue_stick' | 'accessory';
  unit: string;
  current_stock: number;
  average_cost?: number;
  unit_cost?: number;
  reorder_point: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface InventoryState {
  items: InventoryItem[];
  currentItem: InventoryItem | null;
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    search?: string;
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: InventoryState = {
  items: [],
  currentItem: null,
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
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params: { page?: number; per_page?: number; type?: string; search?: string } = {}) => {
    const response = await api.get('/admin/inventory', { 
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data;
  }
);

export const fetchInventoryItem = createAsyncThunk(
  'inventory/fetchItem',
  async (id: number) => {
    const response = await api.get(`/admin/inventory/${id}`);
    return response.data.data;
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createItem',
  async (itemData: Partial<InventoryItem>) => {
    const response = await api.post('/admin/inventory', itemData);
    return response.data.data;
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, data }: { id: number; data: Partial<InventoryItem> }) => {
    const response = await api.put(`/admin/inventory/${id}`, data);
    return response.data.data;
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async ({ id, quantity_change, reason, notes }: { id: number; quantity_change: number; reason: string; notes?: string }) => {
    const response = await api.post(`/admin/inventory/${id}/adjust`, { quantity_change, reason, notes });
    return response.data.data;
  }
);

export const fetchItemsNeedingReorder = createAsyncThunk(
  'inventory/needsReorder',
  async () => {
    const response = await api.get('/admin/inventory/needs-reorder');
    return response.data.data;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id: number) => {
    await api.delete(`/admin/inventory/${id}`);
    return id;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
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
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      // Fetch single item
      .addCase(fetchInventoryItem.fulfilled, (state, action) => {
        state.currentItem = action.payload;
      })
      // Create item
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update item
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      // Delete item
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { clearCurrentItem, setFilters, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;

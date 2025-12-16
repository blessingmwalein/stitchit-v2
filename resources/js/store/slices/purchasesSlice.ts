import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  reference: string;
  state: 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED';
  expected_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: any;
  lines?: any[];
}

interface PurchasesState {
  items: PurchaseOrder[];
  currentPO: PurchaseOrder | null;
  loading: boolean;
  error: string | null;
  filters: {
    state?: string;
    supplier_id?: number;
    search?: string;
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: PurchasesState = {
  items: [],
  currentPO: null,
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
export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (params: { page?: number; per_page?: number; state?: string; supplier_id?: number; search?: string } = {}) => {
    const response = await axios.get('/admin/purchases', { 
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data;
  }
);

export const fetchPurchaseOrder = createAsyncThunk(
  'purchases/fetchPurchaseOrder',
  async (id: number) => {
    const response = await axios.get(`/admin/purchases/${id}`);
    return response.data.data;
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'purchases/createPurchaseOrder',
  async (poData: any) => {
    const response = await axios.post('/admin/purchases', poData);
    return response.data.data;
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  'purchases/updatePurchaseOrder',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await axios.put(`/admin/purchases/${id}`, data);
    return response.data.data;
  }
);

export const sendPurchaseOrder = createAsyncThunk(
  'purchases/sendPurchaseOrder',
  async (id: number) => {
    const response = await axios.post(`/admin/purchases/${id}/send`);
    return response.data.data;
  }
);

export const receiveGoods = createAsyncThunk(
  'purchases/receiveGoods',
  async ({ id, receiptData }: { id: number; receiptData: any }) => {
    const response = await axios.post(`/admin/purchases/${id}/receive`, receiptData);
    return response.data.data;
  }
);

export const closePurchaseOrder = createAsyncThunk(
  'purchases/closePurchaseOrder',
  async (id: number) => {
    const response = await axios.post(`/admin/purchases/${id}/close`);
    return response.data.data;
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  'purchases/deletePurchaseOrder',
  async (id: number) => {
    await axios.delete(`/admin/purchases/${id}`);
    return id;
  }
);

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearCurrentPO: (state) => {
      state.currentPO = null;
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
      // Fetch purchase orders
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch purchase orders';
      })
      // Fetch single PO
      .addCase(fetchPurchaseOrder.fulfilled, (state, action) => {
        state.currentPO = action.payload;
      })
      // Create PO
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update PO
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentPO?.id === action.payload.id) {
          state.currentPO = action.payload;
        }
      })
      // Send PO
      .addCase(sendPurchaseOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentPO?.id === action.payload.id) {
          state.currentPO = action.payload;
        }
      })
      // Delete PO
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearCurrentPO, setFilters, clearError } = purchasesSlice.actions;
export default purchasesSlice.reducer;

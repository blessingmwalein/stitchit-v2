import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/axios';

export interface OrderItem {
  id: number;
  order_id: number;
  sku?: string;
  description: string;
  quantity: number;
  width: string;
  height: string;
  unit: string;
  area: string;
  planned_price: string;
  notes?: string;
  design_image_path?: string;
  design_image_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Order {
  id: number;
  client_id: number;
  reference: string;
  state: string;
  deposit_percent: string;
  deposit_required_amount: string;
  total_amount: string;
  balance_due: string;
  notes?: string;
  delivery_address?: string;
  delivery_contact?: string;
  preferred_dimensions_unit: string;
  items_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  client?: {
    id: number;
    phone: string;
    full_name: string;
    display_name?: string;
    nickname?: string;
    address?: string;
    gender?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
  };
  items?: OrderItem[];
  payments?: any[];
  dispatch?: any;
}

interface OrdersState {
  items: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: {
    state?: string;
    client_id?: number;
    search?: string;
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: OrdersState = {
  items: [],
  currentOrder: null,
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
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; per_page?: number; state?: string; client_id?: number; search?: string } = {}) => {
    const response = await api.get('/admin/orders', { 
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data;
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (id: number) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data.data;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any) => {
    const response = await api.post('/admin/orders', orderData);
    return response.data.data;
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await api.put(`/admin/orders/${id}`, data);
    return response.data.data;
  }
);

export const transitionOrderState = createAsyncThunk(
  'orders/transitionState',
  async ({ id, state }: { id: number; state: string }) => {
    const response = await api.post(`/admin/orders/${id}/transition`, { state });
    return response.data.data;
  }
);

export const recordPayment = createAsyncThunk(
  'orders/recordPayment',
  async ({ id, paymentData }: { id: number; paymentData: any }) => {
    const response = await api.post(`/admin/orders/${id}/payment`, paymentData);
    return response.data.data;
  }
);

export const convertToProduction = createAsyncThunk(
  'orders/convertToProduction',
  async (id: number) => {
    const response = await api.post(`/admin/orders/${id}/convert-to-production`);
    return response.data.data;
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: number) => {
    await api.delete(`/admin/orders/${id}`);
    return id;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Fetch single order
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      // Create order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      // Transition state
      .addCase(transitionOrderState.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload);
      });
  },
});

export const { clearCurrentOrder, setFilters, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;

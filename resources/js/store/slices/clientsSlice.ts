import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/axios';

export interface Client {
  id: number;
  phone: string;
  full_name: string | null;
  nickname: string | null;
  address: string | null;
  gender: 'male' | 'female' | 'other' | null;
  notes: string | null;
  display_name: string;
  created_at: string;
  updated_at: string;
  orders_count?: number;
  total_spent?: number;
}

interface ClientsState {
  items: Client[];
  currentClient: Client | null;
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: ClientsState = {
  items: [],
  currentClient: null,
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
};

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: { page?: number; per_page?: number } = {}) => {
    const response = await api.get('/admin/clients', { 
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data;
  }
);

export const fetchClient = createAsyncThunk(
  'clients/fetchClient',
  async (id: number) => {
    const response = await api.get(`/admin/clients/${id}`);
    return response.data.data;
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData: Partial<Client>) => {
    const response = await api.post('/admin/clients', clientData);
    return response.data.data;
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, data }: { id: number; data: Partial<Client> }) => {
    const response = await api.put(`/admin/clients/${id}`, data);
    return response.data.data;
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: number) => {
    await api.delete(`/admin/clients/${id}`);
    return id;
  }
);

export const searchClients = createAsyncThunk(
  'clients/searchClients',
  async (query: string) => {
    const response = await api.get('/admin/clients/search', { params: { q: query } });
    return response.data.data;
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch clients';
      })
      // Fetch single client
      .addCase(fetchClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch client';
      })
      // Create client
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update client
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentClient?.id === action.payload.id) {
          state.currentClient = action.payload;
        }
      })
      // Delete client
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
        if (state.currentClient?.id === action.payload) {
          state.currentClient = null;
        }
      })
      // Search clients
      .addCase(searchClients.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearCurrentClient, clearError } = clientsSlice.actions;
export default clientsSlice.reducer;

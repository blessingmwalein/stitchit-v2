import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/axios';

export interface Expense {
  id: number;
  reference: string;
  expense_date: string;
  category: string;
  vendor_name: string | null;
  amount: number;
  payment_method: string;
  receipt_number: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpensesState {
  items: Expense[];
  currentExpense: Expense | null;
  loading: boolean;
  error: string | null;
  filters: {
    category?: string;
    payment_method?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: ExpensesState = {
  items: [],
  currentExpense: null,
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
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params: { 
    page?: number; 
    per_page?: number; 
    category?: string; 
    payment_method?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    sort_field?: string;
    sort_direction?: string;
  } = {}) => {
    const response = await api.get('/admin/accounting/expenses', { 
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data;
  }
);

export const fetchExpense = createAsyncThunk(
  'expenses/fetchExpense',
  async (id: number) => {
    const response = await api.get(`/admin/accounting/expenses/${id}`);
    return response.data.data;
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: Partial<Expense>) => {
    const response = await api.post('/admin/accounting/expenses', expenseData);
    return response.data.data;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: number; data: Partial<Expense> }) => {
    const response = await api.put(`/admin/accounting/expenses/${id}`, data);
    return response.data.data;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: number) => {
    await api.delete(`/admin/accounting/expenses/${id}`);
    return id;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
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
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      // Fetch single expense
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.currentExpense = action.payload;
      })
      // Create expense
      .addCase(createExpense.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentExpense?.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
      })
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { clearCurrentExpense, setFilters, clearError } = expensesSlice.actions;
export default expensesSlice.reducer;

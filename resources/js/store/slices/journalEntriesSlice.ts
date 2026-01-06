import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/axios';

export interface JournalEntryLine {
  id: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string | null;
  account: {
    id: number;
    code: string;
    name: string;
    type: string;
    category: string;
  };
}

export interface JournalEntry {
  id: number;
  reference: string;
  transaction_date: string;
  type: string;
  description: string;
  status: string;
  lines: JournalEntryLine[];
  created_at: string;
  posted_at: string | null;
  created_by?: {
    id: number;
    name: string;
  };
}

interface JournalEntriesState {
  items: JournalEntry[];
  currentEntry: JournalEntry | null;
  loading: boolean;
  error: string | null;
  filters: {
    search?: string;
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_field?: string;
    sort_direction?: 'asc' | 'desc';
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: JournalEntriesState = {
  items: [],
  currentEntry: null,
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
export const fetchJournalEntries = createAsyncThunk(
  'journalEntries/fetchJournalEntries',
  async (params: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_field?: string;
    sort_direction?: string;
  } = {}) => {
    const response = await api.get('/admin/accounting/journal-entries', {
      params,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    return response.data;
  }
);

export const fetchJournalEntry = createAsyncThunk(
  'journalEntries/fetchJournalEntry',
  async (id: number) => {
    const response = await api.get(`/admin/accounting/journal-entries/${id}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    return response.data.data || response.data;
  }
);

export const voidJournalEntry = createAsyncThunk(
  'journalEntries/voidJournalEntry',
  async (id: number) => {
    const response = await api.post(`/admin/accounting/journal-entries/${id}/void`);
    return response.data;
  }
);

const journalEntriesSlice = createSlice({
  name: 'journalEntries',
  initialState,
  reducers: {
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    setFilters: (state, action: PayloadAction<JournalEntriesState['filters']>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch journal entries
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        if (action.payload.current_page) {
          state.pagination = {
            current_page: action.payload.current_page,
            last_page: action.payload.last_page,
            per_page: action.payload.per_page,
            total: action.payload.total,
          };
        }
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch journal entries';
      })
      // Fetch single entry
      .addCase(fetchJournalEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEntry = action.payload;
      })
      .addCase(fetchJournalEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch journal entry';
      })
      // Void entry
      .addCase(voidJournalEntry.pending, (state) => {
        state.loading = true;
      })
      .addCase(voidJournalEntry.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(voidJournalEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to void journal entry';
      });
  },
});

export const { clearCurrentEntry, setFilters, clearError } = journalEntriesSlice.actions;
export default journalEntriesSlice.reducer;

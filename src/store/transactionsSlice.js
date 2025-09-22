import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getTransactions as apiGetTransactions,
  createTransaction as apiCreateTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
} from '../services/transactionsService';

// Thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const res = await apiGetTransactions(filters || {});
      return res.transactions || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiCreateTransaction(data);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateTransaction(id, data);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiDeleteTransaction(id);
      return { id, ...res };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete transaction');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  filters: { type: '', start: '', end: '' },
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { type: '', start: '', end: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch transactions';
      })
      .addCase(createTransaction.fulfilled, (state) => {})
      .addCase(updateTransaction.fulfilled, (state) => {})
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.items = state.items.filter((t) => (t._id || t.id) !== id);
      });
  },
});

export const { setFilters, clearFilters } = transactionsSlice.actions;
export default transactionsSlice.reducer;



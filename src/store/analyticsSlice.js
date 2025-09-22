import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAnalytics as apiGetAnalytics } from '../services/transactionsService';

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetch',
  async (filters, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const effectiveFilters = filters || state.analytics.filters;
      const res = await apiGetAnalytics(effectiveFilters);
      return res.analytics || null;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch analytics');
    }
  }
);

const initialState = {
  analytics: null,
  loading: false,
  error: null,
  filters: { year: new Date().getFullYear(), month: '' },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analytics';
        state.analytics = null;
      });
  },
});

export const { setAnalyticsFilters } = analyticsSlice.actions;
export default analyticsSlice.reducer;



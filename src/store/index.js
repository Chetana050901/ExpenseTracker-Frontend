import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from '../store/transactionsSlice';
import analyticsReducer from '../store/analyticsSlice';

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    analytics: analyticsReducer,
  },
});

export default store;



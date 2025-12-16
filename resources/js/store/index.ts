import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './slices/clientsSlice';
import ordersReducer from './slices/ordersSlice';
import inventoryReducer from './slices/inventorySlice';
import productionReducer from './slices/productionSlice';
import purchasesReducer from './slices/purchasesSlice';
import expensesReducer from './slices/expensesSlice';
import journalEntriesReducer from './slices/journalEntriesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    orders: ordersReducer,
    inventory: inventoryReducer,
    production: productionReducer,
    purchases: purchasesReducer,
    expenses: expensesReducer,
    journalEntries: journalEntriesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['ui/showNotification'],
        // Ignore these paths in the state
        ignoredPaths: ['ui.notifications'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Redux Store Configuration
 * Sets up the Redux store with Redux Toolkit and persistence
 */

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
// Safe storage wrapper — falls back to noop if localStorage is blocked (Safari private mode)
function createSafeStorage() {
  try {
    window.localStorage.setItem("__persist_test__", "1");
    window.localStorage.removeItem("__persist_test__");
    return window.localStorage;
  } catch {
    // localStorage blocked (private mode, Safari ITP) — use no-op storage
    return {
      getItem: () => Promise.resolve(null),
      setItem: (_k, v) => Promise.resolve(v),
      removeItem: () => Promise.resolve(),
    };
  }
}
const storage = createSafeStorage();
import { combineReducers } from "@reduxjs/toolkit";

// Import all slices
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice";

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
});

// Persist configuration
const persistConfig = {
  key: "design-den-root",
  storage,
  whitelist: ["auth", "cart"], // Only persist auth and cart
  blacklist: ["ui"], // Don't persist UI state
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: import.meta.env.MODE !== "production",
});

// Create persistor
export const persistor = persistStore(store);

// Export types for TypeScript (optional)
export const getState = store.getState;
export const dispatch = store.dispatch;

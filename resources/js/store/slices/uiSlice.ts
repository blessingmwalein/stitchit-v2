import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  loading: {
    global: false,
  },
  modals: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof document !== 'undefined') {
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    showNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        ...action.payload,
        duration: action.payload.duration || 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  showNotification,
  removeNotification,
  setLoading,
  setGlobalLoading,
  openModal,
  closeModal,
  toggleModal,
} = uiSlice.actions;

export default uiSlice.reducer;

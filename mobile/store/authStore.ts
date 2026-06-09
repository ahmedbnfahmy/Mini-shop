import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,
  
  login: async (user: User, token: string) => {
    await SecureStore.setItemAsync('user_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const userDataStr = await SecureStore.getItemAsync('user_data');
      
      if (token && userDataStr) {
        const user = JSON.parse(userDataStr);
        set({ user, token, isAuthenticated: true, isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } catch (e) {
      console.error('Failed to initialize auth', e);
      set({ isInitializing: false });
    }
  }
}));

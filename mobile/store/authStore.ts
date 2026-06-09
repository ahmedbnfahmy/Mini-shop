import { create } from 'zustand';
import { deleteItem, getItem, setItem } from '../utils/storage';
import { isTokenExpired } from '../utils/token';

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
  handleSessionExpired: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,
  
  login: async (user: User, token: string) => {
    await setItem('user_token', token);
    await setItem('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    await deleteItem('user_token');
    await deleteItem('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },

  handleSessionExpired: async () => {
    await deleteItem('user_token');
    await deleteItem('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initAuth: async () => {
    try {
      const token = await getItem('user_token');
      const userDataStr = await getItem('user_data');
      
      if (token && userDataStr && !isTokenExpired(token)) {
        const user = JSON.parse(userDataStr);
        set({ user, token, isAuthenticated: true, isInitializing: false });
      } else {
        if (token) {
          await deleteItem('user_token');
          await deleteItem('user_data');
        }
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
      }
    } catch (e) {
      console.error('Failed to initialize auth', e);
      set({ isInitializing: false });
    }
  }
}));

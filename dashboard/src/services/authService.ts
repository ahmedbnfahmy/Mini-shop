import { api } from './api';

export const authService = {
  registerAdmin: async (name: string, email: string, password: string) => {
    return api.post('/auth/register/admin', { name, email, password });
  },

  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  getProfile: async () => {
    return api.get('/auth/me');
  },
};

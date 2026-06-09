import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  
  // Note: Only admins should use the dashboard, so no register needed here.
  
  getProfile: async () => {
    return api.get('/auth/me');
  }
};

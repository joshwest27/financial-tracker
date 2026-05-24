import { apiRequest } from './client';

export const register = (email, password) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const login = (email, password) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiRequest('/auth/me');

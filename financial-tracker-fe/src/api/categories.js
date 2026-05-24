import { apiRequest } from './client';

export const getCategories = () => apiRequest('/categories');

export const createCategory = (name, type) =>
  apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify({ name, type }),
  });

export const deleteCategory = (id) =>
  apiRequest(`/categories/${id}`, { method: 'DELETE' });

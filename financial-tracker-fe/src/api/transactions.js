import { apiRequest } from './client';

export const getTransactions = () => apiRequest('/transactions');

export const createTransaction = (transaction) =>
  apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });

export const deleteTransaction = (id) =>
  apiRequest(`/transactions/${id}`, { method: 'DELETE' });

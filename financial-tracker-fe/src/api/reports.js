import { apiRequest } from './client';

export const getMonthlyReport = (year, month) =>
  apiRequest(`/reports/monthly?year=${year}&month=${month}`);

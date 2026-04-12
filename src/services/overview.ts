import api from '@/lib/api';

export const getOverviewStats = async () => {
  const { data } = await api.get('/overview');
  return data;
};
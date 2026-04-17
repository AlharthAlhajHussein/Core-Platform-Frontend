import api from '@/lib/api';

export const getConversations = async (params?: any) => {
  const { data } = await api.get('/conversations', { params });
  return data;
};

export const getConversation = async (convId: string) => {
  const { data } = await api.get(`/conversations/${convId}`);
  return data;
};

export const updateConversationStatus = async (convId: string, status: string) => {
  const { data } = await api.put(`/conversations/${convId}/status`, { status });
  return data;
};

export const evaluateConversation = async (convId: string, evaluation: string, notes?: string) => {
  // Notes are strictly required for 'OTHERS' as per the API docs
  const { data } = await api.put(`/conversations/${convId}/evaluation`, { evaluation, notes });
  return data;
};

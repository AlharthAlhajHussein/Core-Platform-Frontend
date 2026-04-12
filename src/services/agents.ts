import api from '@/lib/api';

export const getAgents = async (sectionId?: string, userId?: string) => {
  const params = new URLSearchParams();
  if (sectionId && sectionId !== 'ALL') params.append('section_id', sectionId);
  if (userId) params.append('user_id', userId);
  
  const { data } = await api.get(`/agents?${params.toString()}`);
  return data;
};

export const createAgent = async (agentData: any) => {
  const { data } = await api.post('/agents', agentData);
  return data;
};

export const updateAgent = async (agentId: string, agentData: any) => {
  const { data } = await api.put(`/agents/${agentId}`, agentData);
  return data;
};

export const deleteAgent = async (agentId: string) => {
  const { data } = await api.delete(`/agents/${agentId}`);
  return data;
};

export const assignEmployeeToAgent = async (agentId: string, userId: string) => {
  const { data } = await api.post(`/agents/${agentId}/assign-employee`, { user_id: userId });
  return data;
};

export const getAgentUsers = async (agentId: string) => {
  const { data } = await api.get(`/agents/${agentId}/users`);
  return data;
};

export const removeEmployeeFromAgent = async (agentId: string, userId: string) => {
  const { data } = await api.delete(`/agents/${agentId}/employees`, { data: { user_id: userId } });
  return data;
};
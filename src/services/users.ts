import api from '@/lib/api';

export const getUsers = async (sectionId?: string) => {
  // Owners can see all users, Supervisors see their section's users.
  // If sectionId is provided, it filters users for that specific section
  const url = sectionId ? `/users?section_id=${sectionId}` : '/users';
  const { data } = await api.get(url);
  return data;
};

export const createUser = async (userData: any) => {
  const { data } = await api.post('/users', userData);
  return data;
};

export const updateUserRole = async (userId: string, role: 'SUPERVISOR' | 'EMPLOYEE') => {
  const { data } = await api.put(`/users/${userId}/role`, { role });
  return data;
};

export const deleteUser = async (userId: string) => {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/users/me');
  return data;
};

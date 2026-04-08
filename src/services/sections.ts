import api from '@/lib/api';

export const getSections = async () => {
  const { data } = await api.get('/sections');
  return data;
};

export const createSection = async (name: string) => {
  const { data } = await api.post('/sections', { name });
  return data;
};

export const deleteSection = async (sectionId: string) => {
  const { data } = await api.delete(`/sections/${sectionId}`);
  return data;
};

export const assignUserToSection = async (sectionId: string, userId: string) => {
  // FastAPI expects { "user_id": "uuid-string" } in the body
  const { data } = await api.post(`/sections/${sectionId}/users`, { user_id: userId });
  return data;
};

export const removeUserFromSection = async (sectionId: string, userId: string) => {
  // Note: Axios requires the body of a DELETE request to be placed inside the `data` config object.
  const { data } = await api.delete(`/sections/${sectionId}/users`, { data: { user_id: userId } });
  return data;
};
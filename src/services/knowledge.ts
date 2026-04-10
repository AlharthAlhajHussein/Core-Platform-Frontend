import api from '@/lib/api';

export const getKnowledgeBuckets = async (sectionId?: string) => {
  // If sectionId is provided (and not 'ALL'), filter by it
  const url = sectionId && sectionId !== 'ALL' ? `/knowledge-buckets?section_id=${sectionId}` : '/knowledge-buckets';
  const { data } = await api.get(url);
  return data;
};

export const createKnowledgeBucket = async (name: string, sectionId: string) => {
  const { data } = await api.post('/knowledge-buckets', { name, section_id: sectionId });
  return data;
};

export const deleteKnowledgeBucket = async (kbId: string) => {
  const { data } = await api.delete(`/knowledge-buckets/${kbId}`);
  return data;
};

export const deleteKnowledgeDocument = async (kbId: string, documentId: string) => {
  const { data } = await api.delete(`/knowledge-buckets/${kbId}/documents/${documentId}`);
  return data;
};

export const uploadKnowledgeFiles = async (kbId: string, files: File[]) => {
  const formData = new FormData();
  // The FastAPI backend expects the key to be 'files' for the list of UploadFiles
  files.forEach(file => formData.append('files', file));

  const { data } = await api.post(`/knowledge-buckets/${kbId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
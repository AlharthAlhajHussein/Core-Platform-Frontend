'use client';

import { useState, useEffect } from 'react';
import { getKnowledgeBuckets, createKnowledgeBucket, deleteKnowledgeBucket, uploadKnowledgeFiles, deleteKnowledgeDocument } from '@/services/knowledge';
import { getSections } from '@/services/sections';
import { getCurrentUser } from '@/services/users';
import { Database, Plus, Trash2, UploadCloud, Filter, X, FileText, File, Check, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface KnowledgeClientProps {
  currentUserRole: 'OWNER' | 'SUPERVISOR' | 'EMPLOYEE';
}

export default function KnowledgeClient({ currentUserRole }: KnowledgeClientProps) {
  // --- STATE MANAGEMENT ---
  const [buckets, setBuckets] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  
  // Filters
  const [filterSectionId, setFilterSectionId] = useState<string>('ALL');

  // Create Modal State (OWNERS & SUPERVISORS ONLY)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbSectionId, setNewKbSectionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Upload Modal State (ALL ROLES)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedKbId, setSelectedKbId] = useState('');
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Custom Dialog States
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // --- DATA FETCHING ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      if (currentUserRole === 'OWNER') {
        const [kbData, sectionsData] = await Promise.all([getKnowledgeBuckets(), getSections()]);
        setBuckets(kbData);
        setSections(sectionsData);
      } else {
        // Supervisors and Employees fetch buckets AND their own profile to get the sections they belong to
        const [kbData, currentUserData] = await Promise.all([getKnowledgeBuckets(), getCurrentUser()]);
        setBuckets(kbData);
        setSections(currentUserData.sections || []);
      }
    } catch (error) {
      console.error('Failed to load initial data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredBuckets = async () => {
    setIsLoading(true);
    try {
      const data = await getKnowledgeBuckets(filterSectionId);
      setBuckets(data);
    } catch (error) {
      console.error('Failed to filter buckets', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (sections.length > 0) fetchFilteredBuckets();
  }, [filterSectionId]);

  // --- HELPERS ---
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  // --- EVENT HANDLERS ---
  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbSectionId) return showAlert(t.knowledge.alerts.missingInfo, t.knowledge.alerts.selectSecMsg, 'error');
    
    setIsCreating(true);
    try {
      await createKnowledgeBucket(newKbName, newKbSectionId);
      setIsCreateOpen(false);
      setNewKbName('');
      setNewKbSectionId('');
      fetchFilteredBuckets();
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteBucket = (kbId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t.knowledge.alerts.deleteBucketTitle,
      message: t.knowledge.alerts.deleteBucketMsg,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteKnowledgeBucket(kbId);
          fetchFilteredBuckets();
        } catch (error: any) {
          showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
        }
      }
    });
  };

  const confirmDeleteDocument = (kbId: string, documentId: string, fileName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t.knowledge.alerts.deleteDocTitle,
      message: `${t.knowledge.alerts.deleteDocMsg1}${fileName}${t.knowledge.alerts.deleteDocMsg2}`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteKnowledgeDocument(kbId, documentId);
          fetchFilteredBuckets();
        } catch (error: any) {
          showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
        }
      }
    });
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to Array
      setFilesToUpload(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesToUpload.length === 0) return showAlert(t.knowledge.alerts.noFilesTitle, t.knowledge.alerts.noFilesMsg, 'error');

    setIsUploading(true);
    try {
      const response = await uploadKnowledgeFiles(selectedKbId, filesToUpload);
      showAlert(t.knowledge.alerts.uploadSuccessTitle, response.message || t.knowledge.alerts.uploadSuccessMsg, 'success');
      setIsUploadOpen(false);
      setFilesToUpload([]);
      fetchFilteredBuckets();
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const openUploadModal = (kbId: string) => {
    setSelectedKbId(kbId);
    setFilesToUpload([]);
    setIsUploadOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl rtl:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="text-indigo-600 dark:text-indigo-400" /> {t.knowledge.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 rtl:text-lg">{t.knowledge.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Section Filter (Visible to Owners, or anyone assigned to > 1 section) */}
          {((currentUserRole === 'OWNER' && sections.length > 0) || sections.length > 1) && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 px-3 py-2 rounded-lg shadow-sm transition-all duration-200">
              <Filter size={16} className="text-slate-400 dark:text-slate-500" />
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                value={filterSectionId}
                onChange={(e) => setFilterSectionId(e.target.value)}
              >
                <option value="ALL">{t.knowledge.filterAll}</option>
                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
              </select>
            </div>
          )}

          {/* Create Button (OWNERS & SUPERVISORS) */}
          {(currentUserRole === 'OWNER' || currentUserRole === 'SUPERVISOR') && (
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
            <Plus size={20} /> {t.knowledge.createBtn}
            </button>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : buckets.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
          <Database className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t.knowledge.noBuckets}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.knowledge.noBucketsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buckets.map((bucket) => (
            <div key={bucket.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl rtl:text-2xl font-bold text-slate-800 dark:text-white">{bucket.name}</h3>
                <div className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 p-2 rounded-lg transition-colors">
                  <Database size={20} />
                </div>
              </div>
              
              {/* Documents List */}
              <div className="flex-1 mb-6">
                <h4 className="text-xs rtl:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t.knowledge.documents} ({bucket.documents?.length || 0})
                </h4>
                {(!bucket.documents || bucket.documents.length === 0) ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">{t.knowledge.noDocs}</p>
                ) : (
                  <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {bucket.documents.map((doc: any) => (
                      <li key={doc.id} className="flex items-center justify-between text-sm p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded group/doc border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                        <div className="flex items-center gap-2 truncate">
                          <File size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300" title={doc.file_name}>{doc.file_name}</span>
                        </div>
                        <button
                          onClick={() => confirmDeleteDocument(bucket.id, doc.id, doc.file_name)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover/doc:opacity-100 transition-all p-1 cursor-pointer"
                          title={t.knowledge.deleteDocTitle}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 transition-colors">
                <button 
                  onClick={() => openUploadModal(bucket.id)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UploadCloud size={16} /> {t.knowledge.uploadBtn}
                </button>
                
                {(currentUserRole === 'OWNER' || currentUserRole === 'SUPERVISOR') && (
                  <button 
                    onClick={() => confirmDeleteBucket(bucket.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                    title={t.knowledge.deleteBucketTitle}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.knowledge.createModalTitle}</h2>
              <button onClick={() => !isCreating && setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBucket} className="p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">{t.knowledge.bucketNameLabel}</label>
              <input 
                type="text" required autoFocus
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none mb-4 text-gray-900 dark:text-white transition-colors"
                placeholder={t.knowledge.bucketNamePlaceholder}
                value={newKbName} onChange={(e) => setNewKbName(e.target.value)}
              />
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">{t.knowledge.assignSecLabel}</label>
              <select 
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none mb-6 text-gray-900 dark:text-white cursor-pointer transition-colors"
                value={newKbSectionId} onChange={(e) => setNewKbSectionId(e.target.value)}
              >
                <option value="" disabled>{t.knowledge.selectSec}</option>
                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
              </select>
              <button type="submit" disabled={isCreating} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer ${isCreating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isCreating ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t.knowledge.creatingBtn}</> : t.knowledge.createBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.knowledge.uploadModalTitle}</h2>
              <button onClick={() => !isUploading && setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleUploadFiles} className="p-6">
              
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all mb-6 relative cursor-pointer group">
                <input 
                  type="file" multiple accept=".pdf,.docx,.txt"
                  onChange={handleFileSelection}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="mx-auto text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mb-3 transition-colors" size={32} />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.knowledge.uploadBox1}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.knowledge.uploadBox2}</p>
              </div>

              {filesToUpload.length > 0 && (
                <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto transition-colors">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{filesToUpload.length} {t.knowledge.filesSelected}</p>
                  <ul className="space-y-1">
                    {filesToUpload.map((f, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 truncate"><File size={14} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" /> {f.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="submit" disabled={isUploading || filesToUpload.length === 0} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all ${isUploading || filesToUpload.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md cursor-pointer'}`}>
                {isUploading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t.knowledge.processingBtn}</> : <><UploadCloud size={20} /> {t.knowledge.uploadSubmitBtn}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {alertDialog.type === 'success' && <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Check size={18} /></div>}
                {alertDialog.type === 'error' && <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400"><AlertCircle size={18} /></div>}
                {alertDialog.type === 'info' && <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><Info size={18} /></div>}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{alertDialog.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 mt-2">{alertDialog.message}</p>
              <button 
                onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer"
              >
                {t.common.okay}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{confirmDialog.message}</p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  {t.common.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
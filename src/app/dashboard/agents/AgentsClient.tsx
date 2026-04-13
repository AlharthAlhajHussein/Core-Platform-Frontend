'use client';

import { useState, useEffect } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent, assignEmployeeToAgent, getAgentUsers, removeEmployeeFromAgent } from '@/services/agents';
import { getSections } from '@/services/sections';
import { getKnowledgeBuckets } from '@/services/knowledge';
import { getUsers, getCurrentUser } from '@/services/users';
import { Bot, Plus, Trash2, Edit, UserPlus, Filter, X, Check, AlertCircle, Info, Power, PowerOff, Users, UserMinus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="text-emerald-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.478-1.638-1.65-1.935-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="text-blue-500">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.45 3.98-1.46.09 0 .28.02.41.11.11.08.15.19.16.32-.01.07-.01.16-.02.21z"/>
  </svg>
)

interface AgentsClientProps {
  currentUserRole: 'OWNER' | 'SUPERVISOR' | 'EMPLOYEE';
}

export default function AgentsClient({ currentUserRole }: AgentsClientProps) {
  // --- STATE MANAGEMENT ---
  const [agents, setAgents] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [knowledgeBuckets, setKnowledgeBuckets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  // Filters
  const [filterSectionId, setFilterSectionId] = useState<string>('ALL');
  const [filterUserId, setFilterUserId] = useState<string>('ALL');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  
  // Assignment Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [agentUsers, setAgentUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Edge cases variables for updating tokens without returning them to frontend
  const [clearWhatsappToken, setClearWhatsappToken] = useState(false);
  const [clearTelegramToken, setClearTelegramToken] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    section_id: '',
    model_type: 'gemini-2.5-flash',
    temperature: 0.7,
    knowledge_bucket_registry_id: '',
    whatsapp_number: '',
    telegram_bot_username: '',
    whatsapp_token: '',
    telegram_token: '',
    is_active: true,
  });

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

  const isManager = currentUserRole === 'OWNER' || currentUserRole === 'SUPERVISOR';

  const fetchAgentUsers = async (agentId: string) => {
    setIsLoadingUsers(true);
    try {
      const data = await getAgentUsers(agentId);
      setAgentUsers(data);
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // --- DATA FETCHING ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [agentsData, kbsData] = await Promise.all([
        getAgents(
          filterSectionId === 'ALL' ? undefined : filterSectionId,
          filterUserId === 'ALL' ? undefined : filterUserId
        ),
        getKnowledgeBuckets(filterSectionId === 'ALL' ? undefined : filterSectionId)
      ]);
      
      setAgents(agentsData);
      setKnowledgeBuckets(kbsData);

      // Load sections for all roles so employees assigned to multiple can filter
      if (currentUserRole === 'OWNER') {
        const sectionsData = await getSections();
        setSections(sectionsData);
      } else {
        const currentUserData = await getCurrentUser();
        setSections(currentUserData.sections || []);
      }

      // Only managers need to load users for assignment and filtering
      if (isManager) {
        const usersData = await getUsers(filterSectionId === 'ALL' ? undefined : filterSectionId);
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Failed to load initial data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [filterSectionId, filterUserId]);

  // --- HELPERS ---
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  const resetForm = () => {
    setFormData({
      name: '', system_prompt: '', section_id: '', model_type: 'gemini-2.5-flash',
      temperature: 0.7, knowledge_bucket_registry_id: '', whatsapp_number: '',
      telegram_bot_username: '', whatsapp_token: '', telegram_token: '', is_active: true
    });
    setEditingAgent(null);
    setClearWhatsappToken(false);
    setClearTelegramToken(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (agent: any) => {
    resetForm();
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      system_prompt: agent.system_prompt || '',
      section_id: agent.section_id || '', // Not used in PUT payload, but kept for logic
      model_type: agent.model_type || 'gemini-2.5-flash',
      temperature: agent.temperature ?? 0.7,
      knowledge_bucket_registry_id: agent.knowledge_bucket_id || '',
      whatsapp_number: agent.whatsapp_number || '',
      telegram_bot_username: agent.telegram_bot_username || '',
      whatsapp_token: '', // Tokens are not returned, keep empty
      telegram_token: '', 
      is_active: agent.is_active ?? true,
    });
    setIsFormOpen(true);
  };

  // --- EVENT HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare Core Payload
      const payload: any = {
        name: formData.name,
        system_prompt: formData.system_prompt,
        model_type: formData.model_type,
        temperature: Number(formData.temperature),
        whatsapp_number: formData.whatsapp_number || "",
        telegram_bot_username: formData.telegram_bot_username || "",
        knowledge_bucket_registry_id: formData.knowledge_bucket_registry_id || "", 
      };

      if (editingAgent) {
        // Handle Update (PUT)
        payload.is_active = formData.is_active;
        
        // Edge Case: Handling tokens updates precisely without destroying existing ones
        if (clearWhatsappToken) {
          payload.whatsapp_token = ""; // Explicitly clear
        } else if (formData.whatsapp_token.trim() !== '') {
          payload.whatsapp_token = formData.whatsapp_token; // Update with new
        }
        
        if (clearTelegramToken) {
          payload.telegram_token = ""; // Explicitly clear
        } else if (formData.telegram_token.trim() !== '') {
          payload.telegram_token = formData.telegram_token; // Update with new
        }
        
        await updateAgent(editingAgent.id, payload);
        showAlert('Success', 'Agent configuration updated successfully!', 'success');
      } else {
        // Handle Create (POST)
        if (!formData.section_id) {
          setIsSubmitting(false);
          return showAlert(t.agents.alerts.missingInfo, t.agents.alerts.missingSec, 'error');
        }
        payload.section_id = formData.section_id;
        
        // On create, if they typed a token, we send it.
        if (formData.whatsapp_token.trim() !== '') payload.whatsapp_token = formData.whatsapp_token;
        if (formData.telegram_token.trim() !== '') payload.telegram_token = formData.telegram_token;

        await createAgent(payload);
        showAlert(t.common.success, t.agents.alerts.createSuccess, 'success');
      }

      setIsFormOpen(false);
      fetchInitialData();
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteAgent = (agentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t.agents.alerts.deleteTitle,
      message: t.agents.alerts.deleteMsg,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteAgent(agentId);
          fetchInitialData();
        } catch (error: any) {
          showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
        }
      }
    });
  };

  const confirmRemoveEmployee = (agentId: string, userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t.agents.alerts.removeEmpTitle,
      message: `${t.agents.alerts.removeEmpMsg1}${userName}${t.agents.alerts.removeEmpMsg2}`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await removeEmployeeFromAgent(agentId, userId);
          showAlert(t.common.success, t.agents.alerts.removeEmpSuccess, 'success');
          fetchAgentUsers(agentId); // Refresh the current modal's list smoothly
        } catch (error: any) {
          showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
        }
      }
    });
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return showAlert(t.agents.alerts.missingInfo, t.agents.alerts.missingEmp, 'error');
    
    setIsAssigning(true);
    try {
      await assignEmployeeToAgent(selectedAgentId, selectedUserId);
      setSelectedUserId('');
      showAlert(t.common.success, t.agents.alerts.assignEmpSuccess, 'success');
      fetchAgentUsers(selectedAgentId); // Refresh the user list visually in the open modal
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl rtl:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="text-indigo-600 dark:text-indigo-400" /> {t.agents.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 rtl:text-lg">{t.agents.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Section Filter */}
          {((currentUserRole === 'OWNER' && sections.length > 0) || sections.length > 1) && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 px-3 py-2 rounded-lg shadow-sm transition-all duration-200">
              <Filter size={16} className="text-slate-400 dark:text-slate-500" />
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                value={filterSectionId}
                onChange={(e) => { setFilterSectionId(e.target.value); setFilterUserId('ALL'); }}
              >
                <option value="ALL">{t.agents.filterAllSec}</option>
                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
              </select>
            </div>
          )}

          {/* Users Filter (Owners/Supervisors only) */}
          {isManager && users.length > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 px-3 py-2 rounded-lg shadow-sm transition-all duration-200">
              <Users size={16} className="text-slate-400 dark:text-slate-500" />
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[150px] truncate"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              >
                <option value="ALL">{t.agents.filterAllUsers}</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
              </select>
            </div>
          )}

          {isManager && (
            <button 
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Plus size={20} /> {t.agents.createBtn}
            </button>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
          <Bot className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t.agents.noAgents}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.agents.noAgentsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className={`bg-white dark:bg-slate-800 border ${agent.is_active ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600' : 'border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800'} rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative flex flex-col`}>
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl rtl:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {agent.name}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg transition-colors ${agent.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`} title={agent.is_active ? t.agents.active : t.agents.suspended}>
                  {agent.is_active ? <Power size={20} /> : <PowerOff size={20} />}
                </div>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                {agent.whatsapp_number && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <WhatsAppIcon /> {agent.whatsapp_number}
                  </div>
                )}
                {agent.telegram_bot_username && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <TelegramIcon /> @{agent.telegram_bot_username}
                  </div>
                )}
                {!agent.whatsapp_number && !agent.telegram_bot_username && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.agents.noChannels}</p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 transition-colors">
                <button 
                  onClick={() => openEditModal(agent)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Edit size={16} /> {t.agents.editBtn}
                </button>
                
                {isManager && (
                  <>
                    <button 
                      onClick={() => { setSelectedAgent(agent); setSelectedAgentId(agent.id); setIsAssignOpen(true); fetchAgentUsers(agent.id); }}
                      className="p-2 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all cursor-pointer"
                      title={t.agents.assignBtn}
                    >
                      <UserPlus size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDeleteAgent(agent.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                      title={t.agents.alerts.deleteTitle}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL (CREATE / EDIT) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors">
            <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingAgent ? t.agents.editModalTitle : t.agents.createModalTitle}</h2>
              <button onClick={() => !isSubmitting && setIsFormOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.nameLabel}</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t.agents.namePlaceholder} />
                </div>
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.sectionLabel}</label>
                  <select required={!editingAgent} disabled={!!editingAgent} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:outline-none text-gray-900 dark:text-white" value={formData.section_id} onChange={e => setFormData({...formData, section_id: e.target.value})}>
                    <option value="" disabled>{t.agents.selectSec}</option>
                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.promptLabel}</label>
                <textarea required rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white" value={formData.system_prompt} onChange={e => setFormData({...formData, system_prompt: e.target.value})} placeholder={t.agents.promptPlaceholder} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.modelLabel}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white" value={formData.model_type} onChange={e => setFormData({...formData, model_type: e.target.value})}>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.tempLabel} ({formData.temperature})</label>
                  <input type="range" min="0" max="2" step="0.1" className="w-full mt-2" value={formData.temperature} onChange={e => setFormData({...formData, temperature: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.linkedKbLabel}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white" value={formData.knowledge_bucket_registry_id} onChange={e => setFormData({...formData, knowledge_bucket_registry_id: e.target.value})}>
                    <option value="">{t.agents.noKb}</option>
                    {knowledgeBuckets.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Integrations */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h4 className="text-sm rtl:text-base font-bold text-slate-800 dark:text-white mb-4">{t.agents.channelsTitle}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.waNumberLabel}</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white" value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} placeholder="+1234567890" />
                    </div>
                    <div>
                      <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.waTokenLabel}</label>
                      <input type="password" disabled={clearWhatsappToken} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white disabled:opacity-50" value={formData.whatsapp_token} onChange={e => setFormData({...formData, whatsapp_token: e.target.value})} placeholder={editingAgent ? t.agents.tokenUpdatePlaceholder : t.agents.tokenPlaceholder} />
                      {editingAgent && (
                        <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                          <input type="checkbox" checked={clearWhatsappToken} onChange={e => setClearWhatsappToken(e.target.checked)} /> {t.agents.clearToken}
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.tgUsernameLabel}</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white" value={formData.telegram_bot_username} onChange={e => setFormData({...formData, telegram_bot_username: e.target.value})} placeholder="MyBot" />
                    </div>
                    <div>
                      <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.agents.tgTokenLabel}</label>
                      <input type="password" disabled={clearTelegramToken} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-gray-900 dark:text-white disabled:opacity-50" value={formData.telegram_token} onChange={e => setFormData({...formData, telegram_token: e.target.value})} placeholder={editingAgent ? t.agents.tokenUpdatePlaceholder : t.agents.tokenPlaceholder} />
                      {editingAgent && (
                        <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                          <input type="checkbox" checked={clearTelegramToken} onChange={e => setClearTelegramToken(e.target.checked)} /> {t.agents.clearToken}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {editingAgent && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                    <input type="checkbox" className="w-4 h-4 text-indigo-600" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                    {t.agents.isActiveLabel}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ltr:ml-6 rtl:mr-6">{t.agents.suspendDesc}</p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isSubmitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t.agents.savingBtn}</> : (editingAgent ? t.agents.saveChangesBtn : t.agents.deployBtn)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN USER MODAL */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.agents.assignModalTitle}</h2>
              <button onClick={() => !isAssigning && setIsAssignOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            
            {/* Users with Access Section */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <label className="block text-sm rtl:text-base font-semibold text-gray-700 dark:text-slate-300 mb-2">{t.agents.usersAccessTitle}</label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
                ) : agentUsers.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {agentUsers.map((u: any, i: number) => (
                      <li key={u.id || i} className="flex items-center justify-between group/user p-1 -mx-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${u.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {t.common.roles[u.role as keyof typeof t.common.roles] || u.role}
                          </span> 
                          {u.first_name} {u.last_name}
                        </div>
                        {u.role === 'EMPLOYEE' && (
                          <button 
                            onClick={() => confirmRemoveEmployee(selectedAgentId, u.id, `${u.first_name} ${u.last_name}`)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover/user:opacity-100 transition-all cursor-pointer p-1 rounded"
                            title={t.agents.removeEmp}
                          >
                            <UserMinus size={14} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">{t.agents.noUsers}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleAssignUser} className="p-6">
              <label className="block text-sm rtl:text-base font-semibold text-gray-700 dark:text-slate-300 mb-2">{t.agents.selectEmpLabel}</label>
              <select 
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none mb-6 text-gray-900 dark:text-white cursor-pointer transition-colors"
                value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="" disabled>{t.agents.chooseEmp}</option>
                {users.filter((u: any) => u.role === 'EMPLOYEE' && !agentUsers.some((au: any) => au.id === u.id)).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email}) - {t.common.roles[user.role as keyof typeof t.common.roles] || user.role}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={isAssigning} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer ${isAssigning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isAssigning ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t.agents.assigningBtn}</> : t.agents.assignBtn}
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
                  {t.common.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
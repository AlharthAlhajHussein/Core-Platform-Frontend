'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUserRole, deleteUser, getCurrentUser } from '@/services/users';
import { getSections, removeUserFromSection } from '@/services/sections';
import { Users, Plus, Trash2, UserMinus, Shield, ShieldAlert, Filter, X, Check, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface UsersClientProps {
  currentUserRole: 'OWNER' | 'SUPERVISOR';
  currentUserId: string;
}

export default function UsersClient({ currentUserRole, currentUserId }: UsersClientProps) {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  
  // Filters
  const [filterSectionId, setFilterSectionId] = useState<string>('ALL');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    section_id: '',
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

  // --- DATA FETCHING ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // If Owner, fetch sections for the filters and dropdowns!
      if (currentUserRole === 'OWNER') {
        const [usersData, sectionsData] = await Promise.all([getUsers(), getSections()]);
        setUsers(usersData);
        setSections(sectionsData);
      } else {
        // Supervisors fetch users AND their own profile to get the sections they manage!
        const [usersData, currentUserData] = await Promise.all([getUsers(), getCurrentUser()]);
        setUsers(usersData);
        setSections(currentUserData.sections || []);
      }
    } catch (error) {
      console.error('Failed to load initial data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch only users when the filter changes (For Owners)
  const fetchFilteredUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers(filterSectionId === 'ALL' ? undefined : filterSectionId);
      setUsers(data);
    } catch (error) {
      console.error('Failed to filter users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Skip initial render fetch since fetchInitialData handles it
    if (sections.length > 0) fetchFilteredUsers();
  }, [filterSectionId]);

  // --- HELPERS ---
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  // --- EVENT HANDLERS ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      // --- FIX APPLIED HERE: Added ': any' to bypass strict TypeScript 'delete' rules ---
      const payload: any = { ...formData };
      
      if (currentUserRole === 'SUPERVISOR') {
        payload.role = 'EMPLOYEE';
        if (!payload.section_id) {
          setIsCreating(false);
          return showAlert(t.users.alerts.missingInfo, t.users.alerts.selectSecNewEmp, 'error');
        }
      } else if (payload.section_id === '') {
        delete payload.section_id; // Owners can omit section_id
      }

      await createUser(payload);
      setIsCreateOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE', section_id: '' });
      
      // Refresh data
      if (currentUserRole === 'OWNER') fetchFilteredUsers();
      else fetchInitialData();
      
      showAlert(t.common.success, t.users.alerts.inviteSuccess, 'success');
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'SUPERVISOR' ? 'EMPLOYEE' : 'SUPERVISOR';
    setConfirmDialog({
      isOpen: true,
      title: t.users.alerts.roleChangeTitle,
      message: `${t.users.alerts.roleChangeMsg1}${t.common.roles[newRole as keyof typeof t.common.roles] || newRole}${t.users.alerts.roleChangeMsg2}`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await updateUserRole(userId, newRole);
          if (currentUserRole === 'OWNER') fetchFilteredUsers();
          else fetchInitialData();
          showAlert(t.common.success, `${t.users.alerts.roleChangeSuccess}${t.common.roles[newRole as keyof typeof t.common.roles] || newRole}.`, 'success');
        } catch (error: any) {
          showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
        }
      }
    });
  };

  const confirmDeleteUser = (userId: string) => {
    // --- SUPERVISOR LOGIC: Remove from section only ---
    if (currentUserRole === 'SUPERVISOR') {
      let sectionIdToRemove = filterSectionId;
      
      // Edge Case: If viewing "All Sections", we need to figure out which section to remove them from
      if (sectionIdToRemove === 'ALL') {
        if (sections.length === 1) {
          sectionIdToRemove = sections[0].id;
        } else {
          return showAlert(t.users.alerts.missingInfo, t.users.alerts.removeSecSelectFilter, 'error');
        }
      }

      setConfirmDialog({
        isOpen: true,
        title: t.users.alerts.removeSecTitle,
        message: t.users.alerts.removeSecMsg,
        onConfirm: async () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          try {
            await removeUserFromSection(sectionIdToRemove, userId);
            fetchFilteredUsers(); // Refresh the list seamlessly
          } catch (error: any) {
            showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
          }
        }
      });
      
    // --- OWNER LOGIC: Delete completely from company ---
    } else {
      setConfirmDialog({
        isOpen: true,
        title: t.users.alerts.deleteTitle,
        message: t.users.alerts.deleteMsg,
        onConfirm: async () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          try {
            await deleteUser(userId);
            fetchFilteredUsers();
          } catch (error: any) {
            showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
          }
        }
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl rtl:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" /> {t.users.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 rtl:text-lg">{t.users.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Section Filter (OWNERS & SUPERVISORS) */}
          {(currentUserRole === 'OWNER' || currentUserRole === 'SUPERVISOR') && sections.length > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-sm transition-colors">
              <Filter size={16} className="text-slate-400 dark:text-slate-500" />
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                value={filterSectionId}
                onChange={(e) => setFilterSectionId(e.target.value)}
              >
                <option value="ALL">{t.users.filterAll}</option>
                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
              </select>
            </div>
          )}

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus size={20} /> {t.users.inviteBtn}
          </button>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm rtl:text-base font-semibold rtl:font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">
                <th className="px-6 py-4">{t.users.tableName}</th>
                <th className="px-6 py-4">{t.users.tableEmail}</th>
                <th className="px-6 py-4">{t.users.tableRole}</th>
                <th className="px-6 py-4 rtl:text-left ltr:text-right">{t.users.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {t.users.noUsers}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user.first_name} {user.last_name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${user.role === 'OWNER' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : user.role === 'SUPERVISOR' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {t.common.roles[user.role as keyof typeof t.common.roles] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      
                      {/* Promote/Demote Button (OWNER ONLY) */}
                      {currentUserRole === 'OWNER' && user.role !== 'OWNER' && (
                        <button 
                          onClick={() => confirmRoleChange(user.id, user.role)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                          title={user.role === 'EMPLOYEE' ? t.users.promoteTitle : t.users.demoteTitle}
                        >
                          {user.role === 'EMPLOYEE' ? <Shield size={18} /> : <ShieldAlert size={18} />}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button 
                        onClick={() => confirmDeleteUser(user.id)}
                        disabled={user.id === currentUserId}
                        className={`p-2 rounded-lg transition-all ${user.id === currentUserId ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 hover:shadow-sm cursor-pointer'}`}
                        title={user.id === currentUserId ? t.users.cannotRemoveSelf : (currentUserRole === 'SUPERVISOR' ? t.users.removeFromSecTitle : t.users.deleteUserTitle)}
                      >
                        {currentUserRole === 'SUPERVISOR' ? <UserMinus size={18} /> : <Trash2 size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.users.inviteModalTitle}</h2>
              <button onClick={() => !isCreating && setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.users.firstName}</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white transition-colors" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.users.lastName}</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white transition-colors" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.users.email}</label>
                <input type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.users.password}</label>
                <input type="password" required minLength={8} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white transition-colors" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.users.roleLabel}</label>
                  {currentUserRole === 'OWNER' ? (
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:outline-none text-gray-900 dark:text-white cursor-pointer transition-colors" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="EMPLOYEE">{t.common.roles['EMPLOYEE']}</option>
                      <option value="SUPERVISOR">{t.common.roles['SUPERVISOR']}</option>
                    </select>
                  ) : (
                    <input type="text" disabled value={t.common.roles['EMPLOYEE']} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed transition-colors" />
                  )}
                </div>
                <div>
                  <label className="block text-xs rtl:text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">{t.users.sectionLabel} {currentUserRole === 'OWNER' ? t.users.optional : ''}</label>
                  <select required={currentUserRole === 'SUPERVISOR'} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:outline-none text-gray-900 dark:text-white cursor-pointer transition-colors" value={formData.section_id} onChange={e => setFormData({...formData, section_id: e.target.value})}>
                    <option value="" disabled={currentUserRole === 'SUPERVISOR'}>{currentUserRole === 'SUPERVISOR' ? t.users.selectSec : t.users.noSection}</option>
                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={isCreating} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all mt-6 cursor-pointer ${isCreating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isCreating ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t.users.creatingBtn}</> : t.users.createBtn}
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
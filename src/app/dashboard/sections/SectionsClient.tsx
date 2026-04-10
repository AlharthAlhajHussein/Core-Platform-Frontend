'use client';

import { useState, useEffect } from 'react';
import { getSections, createSection, deleteSection, assignUserToSection, removeUserFromSection } from '@/services/sections';
import { getUsers } from '@/services/users';
import { Layers, Plus, Trash2, UserPlus, UserMinus, X, Check, AlertCircle, Info } from 'lucide-react';

export default function SectionsClient() {
  // --- STATE MANAGEMENT ---
  const [sections, setSections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sectionUsersMap, setSectionUsersMap] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

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
  // useEffect runs once when the component mounts
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sectionsData, usersData] = await Promise.all([getSections(), getUsers()]);
      setSections(sectionsData);
      setUsers(usersData);

      // Fetch users specifically for each section to display in the cards
      const usersMap: Record<string, any[]> = {};
      await Promise.all(
        sectionsData.map(async (section: any) => {
          usersMap[section.id] = await getUsers(section.id);
        })
      );
      setSectionUsersMap(usersMap);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPERS ---
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  // --- EVENT HANDLERS ---
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createSection(newSectionName);
      setIsCreateOpen(false); // Close Modal
      setNewSectionName('');  // Reset Input
      fetchData();            // Refresh Data
      showAlert('Success', 'Section created successfully!', 'success');
    } catch (error: any) {
      showAlert('Error', error.response?.data?.detail || 'Failed to create section', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteSection = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteSection(id);
          fetchData(); 
        } catch (error: any) {
          showAlert('Error', error.response?.data?.detail || 'Failed to delete section', 'error');
        }
      }
    });
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return showAlert("Missing Information", "Please select a user", 'error');
    
    setIsAssigning(true);
    try {
      await assignUserToSection(selectedSectionId, selectedUserId);
      setIsAssignOpen(false); // Close Modal
      setSelectedUserId('');  // Reset Input
      fetchData(); // Refresh the data to show the new user in the section!
      showAlert('Success', 'User assigned successfully!', 'success');
    } catch (error: any) {
      showAlert('Error', error.response?.data?.detail || 'Failed to assign user', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const confirmRemoveUser = (sectionId: string, userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove User',
      message: `Are you sure you want to remove ${userName} from this section?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await removeUserFromSection(sectionId, userId);
          fetchData();
        } catch (error: any) {
          showAlert('Error', error.response?.data?.detail || 'Failed to remove user', 'error');
        }
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-indigo-600" /> Sections Management
          </h1>
          <p className="text-slate-500 mt-1">Create logic groupings for your agents and team members.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus size={20} /> Create Section
        </button>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Layers className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900">No sections found</h3>
          <p className="text-slate-500 mt-1">Get started by creating a new section for your company.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            // Get the users we fetched specifically for this section
            const sectionUsers = sectionUsersMap[section.id] || [];

            return (
            <div key={section.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{section.name}</h3>
              
              {/* Users List Display */}
              <div className="flex-1 mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Users</h4>
                {sectionUsers.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No users assigned yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {sectionUsers.map(user => (
                      <li key={user.id} className="flex items-center justify-between text-sm group/user p-1 -mx-1 rounded hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                        {/* group/user creates a targeted hover context for this specific list item */}
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{user.first_name} {user.last_name}</span>
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">{user.role}</span>
                        </div>
                        <button
                          onClick={() => confirmRemoveUser(section.id, user.id, `${user.first_name} ${user.last_name}`)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/user:opacity-100 transition-all p-1 rounded cursor-pointer"
                          title={`Remove ${user.first_name}`}
                        >
                          <UserMinus size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={() => { setSelectedSectionId(section.id); setIsAssignOpen(true); }}
                  className="flex-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserPlus size={16} /> Assign User
                </button>
                <button 
                  onClick={() => confirmDeleteSection(section.id)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                  title="Delete Section"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Create New Section</h2>
              <button onClick={() => !isCreating && setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSection} className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section Name</label>
              <input 
                type="text" required autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none mb-6 text-gray-900"
                placeholder="e.g., Customer Support"
                value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)}
              />
              <button type="submit" disabled={isCreating} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer ${isCreating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isCreating ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Creating...</> : 'Create Section'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN USER MODAL */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Assign User to Section</h2>
              <button onClick={() => !isAssigning && setIsAssignOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignUser} className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select User</label>
              <select 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none mb-6 text-gray-900 cursor-pointer"
                value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="" disabled>-- Choose a user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={isAssigning} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer ${isAssigning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isAssigning ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Assigning...</> : 'Assign User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {alertDialog.type === 'success' && <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Check size={18} /></div>}
                {alertDialog.type === 'error' && <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertCircle size={18} /></div>}
                {alertDialog.type === 'info' && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Info size={18} /></div>}
                <h3 className="text-lg font-bold text-slate-900">{alertDialog.title}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 mt-2">{alertDialog.message}</p>
              <button 
                onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-600 mb-6">{confirmDialog.message}</p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

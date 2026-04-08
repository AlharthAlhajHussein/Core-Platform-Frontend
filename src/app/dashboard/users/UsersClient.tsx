'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUserRole, deleteUser, getCurrentUser } from '@/services/users';
import { getSections } from '@/services/sections';
import { Users, Plus, Trash2, Shield, ShieldAlert, Filter, X } from 'lucide-react';

interface UsersClientProps {
  currentUserRole: 'OWNER' | 'SUPERVISOR';
  currentUserId: string;
}

export default function UsersClient({ currentUserRole, currentUserId }: UsersClientProps) {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterSectionId, setFilterSectionId] = useState<string>('ALL');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    section_id: '',
  });

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

  // --- EVENT HANDLERS ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up payload based on role
      const payload = { ...formData };
      if (currentUserRole === 'SUPERVISOR') {
        payload.role = 'EMPLOYEE';
        if (!payload.section_id) {
          return alert('Please select a section for the new employee.');
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
      
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'SUPERVISOR' ? 'EMPLOYEE' : 'SUPERVISOR';
    if (!window.confirm(`Are you sure you want to change this user to ${newRole}?`)) return;
    
    try {
      await updateUserRole(userId, newRole);
      if (currentUserRole === 'OWNER') fetchFilteredUsers();
      else fetchInitialData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user completely? This action cannot be undone.')) return;
    
    try {
      await deleteUser(userId);
      if (currentUserRole === 'OWNER') fetchFilteredUsers();
      else fetchInitialData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Users
          </h1>
          <p className="text-slate-500 mt-1">Manage employee accounts, roles, and access.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Section Filter (OWNERS & SUPERVISORS) */}
          {(currentUserRole === 'OWNER' || currentUserRole === 'SUPERVISOR') && sections.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
              <Filter size={16} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                value={filterSectionId}
                onChange={(e) => setFilterSectionId(e.target.value)}
              >
                <option value="ALL">All Sections</option>
                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
              </select>
            </div>
          )}

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Invite User
          </button>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.first_name} {user.last_name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'OWNER' ? 'bg-purple-100 text-purple-700' : user.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      
                      {/* Promote/Demote Button (OWNER ONLY) */}
                      {currentUserRole === 'OWNER' && user.role !== 'OWNER' && (
                        <button 
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title={user.role === 'EMPLOYEE' ? 'Promote to Supervisor' : 'Demote to Employee'}
                        >
                          {user.role === 'EMPLOYEE' ? <Shield size={18} /> : <ShieldAlert size={18} />}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUserId}
                        className={`p-2 rounded-lg transition-colors ${user.id === currentUserId ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        title={user.id === currentUserId ? "You cannot delete yourself" : "Delete User"}
                      >
                        <Trash2 size={18} />
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Invite New User</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-gray-900" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-gray-900" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
                <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-gray-900" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Password</label>
                <input type="password" required minLength={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-gray-900" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Role</label>
                  {currentUserRole === 'OWNER' ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="SUPERVISOR">Supervisor</option>
                    </select>
                  ) : (
                    <input type="text" disabled value="Employee" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Section {currentUserRole === 'OWNER' ? '(Optional)' : ''}</label>
                  <select required={currentUserRole === 'SUPERVISOR'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900" value={formData.section_id} onChange={e => setFormData({...formData, section_id: e.target.value})}>
                    <option value="" disabled={currentUserRole === 'SUPERVISOR'}>{currentUserRole === 'SUPERVISOR' ? '-- Select a section --' : 'No Section'}</option>
                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors mt-6">
                Create User Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
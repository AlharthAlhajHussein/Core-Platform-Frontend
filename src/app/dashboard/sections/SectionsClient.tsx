'use client';

import { useState, useEffect } from 'react';
import { getSections, createSection, deleteSection, assignUserToSection, removeUserFromSection } from '@/services/sections';
import { getUsers } from '@/services/users';
import { Layers, Plus, Trash2, UserPlus, UserMinus, X } from 'lucide-react';

export default function SectionsClient() {
  // --- STATE MANAGEMENT ---
  const [sections, setSections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sectionUsersMap, setSectionUsersMap] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

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

  // --- EVENT HANDLERS ---
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSection(newSectionName);
      setIsCreateOpen(false); // Close Modal
      setNewSectionName('');  // Reset Input
      fetchData();            // Refresh Data
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create section');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    
    try {
      await deleteSection(id);
      fetchData(); // Refresh Data
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete section');
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Please select a user");
    
    try {
      await assignUserToSection(selectedSectionId, selectedUserId);
      setIsAssignOpen(false); // Close Modal
      alert('User assigned successfully!');
      fetchData(); // Refresh the data to show the new user in the section!
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to assign user');
    }
  };

  const handleRemoveUser = async (sectionId: string, userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this section?`)) return;
    try {
      await removeUserFromSection(sectionId, userId);
      fetchData(); // Automatically refresh the data to remove the user from the screen
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to remove user');
    }
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
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
            <div key={section.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{section.name}</h3>
              
              {/* Users List Display */}
              <div className="flex-1 mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Users</h4>
                {sectionUsers.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No users assigned yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {sectionUsers.map(user => (
                      <li key={user.id} className="flex items-center justify-between text-sm group/user p-1 -mx-1 rounded hover:bg-slate-50 transition-colors">
                        {/* group/user creates a targeted hover context for this specific list item */}
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{user.first_name} {user.last_name}</span>
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">{user.role}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(section.id, user.id, `${user.first_name} ${user.last_name}`)}
                          className="text-slate-400 hover:text-red-600 opacity-0 group-hover/user:opacity-100 transition-opacity p-1 rounded hover:bg-red-100"
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
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus size={16} /> Assign User
                </button>
                <button 
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSection} className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section Name</label>
              <input 
                type="text" required autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none mb-6 text-gray-900"
                placeholder="e.g., Customer Support"
                value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)}
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Create Section
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
              <button onClick={() => setIsAssignOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignUser} className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select User</label>
              <select 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none mb-6 text-gray-900"
                value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="" disabled>-- Choose a user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Assign User
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

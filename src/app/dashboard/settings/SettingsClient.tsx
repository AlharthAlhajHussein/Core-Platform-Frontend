'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, updateUserProfile, updateUserAccount, uploadProfileImage } from '@/services/users';
import { Settings, User, Moon, Globe, Trash2, Check, AlertCircle, Info, Save, Shield, Camera, X } from 'lucide-react';
import Image from 'next/image';

interface SettingsClientProps {
  currentUserId: string;
  currentUserRole: string;
}

export default function SettingsClient({ currentUserId, currentUserRole }: SettingsClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEmail, setCurrentEmail] = useState('');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    bio: '',
    phone_number: '',
    country: '',
    gender: 'Male',
    profile_image: '',
  });

  // Account Security State
  const [accountData, setAccountData] = useState({
    old_password: '',
    new_email: '',
    new_password: '',
  });

  // Preferences State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

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

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch User Profile
        const userData = await getCurrentUser();
        setProfileData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          position: userData.position || '',
          bio: userData.bio || '',
          phone_number: userData.phone_number || '',
          country: userData.country || '',
          gender: userData.gender || 'Male',
          profile_image: userData.profile_image || '',
        });
        setCurrentEmail(userData.email || '');

        // 2. Hydrate Theme from Local Storage
        let currentTheme = localStorage.getItem('theme');
        if (!currentTheme) {
          // Edge Case: No theme saved yet, check user's OS preference
          currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          localStorage.setItem('theme', currentTheme);
        }

        setTheme(currentTheme as 'light' | 'dark');
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // 3. Hydrate Language from Local Storage
        const savedLang = localStorage.getItem('language') || 'en';
        setLanguage(savedLang as 'en' | 'ar');

      } catch (error) {
        showAlert('Error', 'Failed to load profile data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, []);

  // --- HELPERS ---
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  // --- EVENT HANDLERS ---
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'en' | 'ar';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Note: Full localization (i18n) setup will be needed to actually translate strings globally.
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Size (e.g., max 5MB) and Type
    if (file.size > 5 * 1024 * 1024) return showAlert('File Too Large', 'Please upload an image smaller than 5MB.', 'error');
    if (!file.type.startsWith('image/')) return showAlert('Invalid File', 'Please upload a valid image file.', 'error');

    setIsUploadingImage(true);
    try {
      // Note: Backend must implement this endpoint to upload to GCS bucket: agent-platform-bucket-1
      const response = await uploadProfileImage(file);
      
      if (response && response.url) {
        const updatedProfile = { ...profileData, profile_image: response.url };
        setProfileData(updatedProfile);
        // Auto-save the profile so the image is immediately persisted
        await updateUserProfile(updatedProfile);
        showAlert('Success', 'Profile image updated successfully.', 'success');
      }
    } catch (error: any) {
      showAlert('Upload Failed', error.response?.data?.detail || 'Failed to upload image.', 'error');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    const updatedProfile = { ...profileData, profile_image: '' };
    setProfileData(updatedProfile);
    try {
      await updateUserProfile(updatedProfile);
      showAlert('Success', 'Profile image removed.', 'success');
    } catch (error: any) {
      showAlert('Error', 'Failed to remove image.', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    try {
      await updateUserProfile(profileData);
      showAlert('Success', 'Your profile information has been successfully updated.', 'success');
    } catch (error: any) {
      showAlert('Error', error.response?.data?.detail || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData.old_password) return showAlert('Required', 'Current password is required to make security changes.', 'error');
    
    // Prepare Payload - Only send changed fields
    const payload: any = { old_password: accountData.old_password };
    if (accountData.new_email.trim() !== '') payload.new_email = accountData.new_email;
    if (accountData.new_password.trim() !== '') payload.new_password = accountData.new_password;

    setIsSavingAccount(true);
    try {
      await updateUserAccount(payload);
      showAlert('Success', 'Account security settings updated successfully.', 'success');
      if (payload.new_email) setCurrentEmail(payload.new_email);
      
      // Clear passwords from form on success
      setAccountData({ old_password: '', new_email: '', new_password: '' });
    } catch (error: any) {
      // Handle specific Edge Cases 
      if (error.response?.status === 401) showAlert('Authentication Failed', 'Your current password was incorrect.', 'error');
      else if (error.response?.status === 409) showAlert('Conflict', 'The requested email is already taken by another user.', 'error');
      else showAlert('Error', error.response?.data?.detail || 'Failed to update account security.', 'error');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const confirmDeleteAccount = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Account',
      message: 'Are you absolutely sure you want to permanently delete your account? All your data will be lost. This cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showAlert('Action Not Allowed', 'Account deletion requires secondary confirmation. Backend endpoint integration pending.', 'error');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-indigo-600" /> Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your profile, preferences, and security.</p>
      </div>

      <div className="space-y-6">
        
        {/* PROFILE SECTION */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><User size={20} /></div>
            <h2 className="text-lg font-bold">Profile Information</h2>
          </div>
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center relative">
                {profileData.profile_image && (profileData.profile_image.startsWith('http') || profileData.profile_image.startsWith('/')) ? (
                    <Image src={profileData.profile_image} alt="Profile" fill className="object-cover" />
                  ) : (
                    <User size={40} className="text-slate-400 dark:text-slate-500" />
                  )}
                  
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Profile Avatar</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
                  <button 
                    onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Camera size={16} /> Upload Image
                  </button>
                  {profileData.profile_image && (
                    <button onClick={handleRemoveImage} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer">
                      <X size={16} /> Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">JPG, PNG or WebP. Max size of 5MB.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Position / Job Title</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} placeholder="e.g. Sales Manager" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input type="tel" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.phone_number} onChange={e => setProfileData({...profileData, phone_number: e.target.value})} placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} placeholder="e.g. USA" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.gender} onChange={e => setProfileData({...profileData, gender: e.target.value})}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white resize-none" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="A short bio about yourself..."></textarea>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingProfile} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${isSavingProfile ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md cursor-pointer'}`}>
                {isSavingProfile ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</> : <><Save size={18} /> Save Profile</>}
              </button>
            </div>
          </form>
        </div>

        {/* ACCOUNT SECURITY SECTION */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Shield size={20} /></div>
            <h2 className="text-lg font-bold">Account Security</h2>
          </div>
          <form onSubmit={handleSaveAccount} className="p-6 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your current login email is <strong className="text-slate-900 dark:text-white">{currentEmail}</strong>. 
                To update your email or password, you must provide your current password.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Email Address</label>
                <input type="email" placeholder="Leave empty to keep current" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={accountData.new_email} onChange={e => setAccountData({...accountData, new_email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                <input type="password" minLength={8} placeholder="Leave empty to keep current" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={accountData.new_password} onChange={e => setAccountData({...accountData, new_password: e.target.value})} />
              </div>
              <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">Current Password (Required to save changes)</label>
                <input type="password" required placeholder="Verify your identity..." className="w-full md:w-1/2 px-4 py-2 border border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:outline-none text-slate-900 dark:text-white" value={accountData.old_password} onChange={e => setAccountData({...accountData, old_password: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingAccount || !accountData.old_password} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${isSavingAccount || !accountData.old_password ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 hover:shadow-md cursor-pointer'}`}>
                {isSavingAccount ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Verifying...</> : <><Shield size={18} /> Update Security</>}
              </button>
            </div>
          </form>
        </div>

        {/* PREFERENCES SECTION */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Settings size={20} /></div>
            <h2 className="text-lg font-bold">Platform Preferences</h2>
          </div>
          <div className="p-6 space-y-4">
            
            {/* Theme Switcher */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm"><Moon size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold">Appearance</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle between Light and Dark mode.</p>
                </div>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg">
                <button onClick={() => handleThemeChange('light')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Light</button>
                <button onClick={() => handleThemeChange('dark')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Dark</button>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm"><Globe size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold">Language</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose your preferred display language.</p>
                </div>
              </div>
              <select value={language} onChange={handleLanguageChange} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 cursor-pointer transition-colors">
                <option value="en">English (US)</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </div>

          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
          <div>
            <h3 className="text-lg font-bold text-red-700 dark:text-red-500 flex items-center gap-2"><Trash2 size={20} /> Danger Zone</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Permanently remove your account and all associated data. This action cannot be undone.</p>
          </div>
          <button onClick={confirmDeleteAccount} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer">
            Delete Account
          </button>
        </div>

      </div>

      {/* MODALS */}
      {/* Custom Alert Modal */}
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
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
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
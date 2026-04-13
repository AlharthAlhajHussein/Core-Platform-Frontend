'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, updateUserProfile, updateUserAccount, uploadProfileImage } from '@/services/users';
import { Settings, User, Moon, Globe, Trash2, Check, AlertCircle, Info, Save, Shield, Camera, X } from 'lucide-react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", 
  "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", 
  "Guatemala", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", 
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", 
  "Kuwait", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Macau", "Malaysia", "Malta", "Mexico", 
  "Moldova", "Monaco", "Morocco", "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nicaragua", 
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Paraguay", "Peru", 
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", 
  "Serbia", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", 
  "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", 
  "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", 
  "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
].sort();

const COUNTRY_CODES = [
  { code: '+93', flag: '🇦🇫', label: 'AF' },
  { code: '+355', flag: '🇦🇱', label: 'AL' },
  { code: '+54', flag: '🇦🇷', label: 'AR' },
  { code: '+43', flag: '🇦🇹', label: 'AT' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+994', flag: '🇦🇿', label: 'AZ' },
  { code: '+387', flag: '🇧🇦', label: 'BA' },
  { code: '+880', flag: '🇧🇩', label: 'BD' },
  { code: '+32', flag: '🇧🇪', label: 'BE' },
  { code: '+359', flag: '🇧🇬', label: 'BG' },
  { code: '+973', flag: '🇧🇭', label: 'BH' },
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+375', flag: '🇧🇾', label: 'BY' },
  { code: '+41', flag: '🇨🇭', label: 'CH' },
  { code: '+56', flag: '🇨🇱', label: 'CL' },
  { code: '+86', flag: '🇨🇳', label: 'CN' },
  { code: '+57', flag: '🇨🇴', label: 'CO' },
  { code: '+506', flag: '🇨🇷', label: 'CR' },
  { code: '+53', flag: '🇨🇺', label: 'CU' },
  { code: '+357', flag: '🇨🇾', label: 'CY' },
  { code: '+420', flag: '🇨🇿', label: 'CZ' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+45', flag: '🇩🇰', label: 'DK' },
  { code: '+213', flag: '🇩🇿', label: 'DZ' },
  { code: '+593', flag: '🇪🇨', label: 'EC' },
  { code: '+372', flag: '🇪🇪', label: 'EE' },
  { code: '+20', flag: '🇪🇬', label: 'EG' },
  { code: '+34', flag: '🇪🇸', label: 'ES' },
  { code: '+358', flag: '🇫🇮', label: 'FI' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+995', flag: '🇬🇪', label: 'GE' },
  { code: '+30', flag: '🇬🇷', label: 'GR' },
  { code: '+852', flag: '🇭🇰', label: 'HK' },
  { code: '+385', flag: '🇭🇷', label: 'HR' },
  { code: '+36', flag: '🇭🇺', label: 'HU' },
  { code: '+62', flag: '🇮🇩', label: 'ID' },
  { code: '+353', flag: '🇮🇪', label: 'IE' },
  { code: '+972', flag: '🇮🇱', label: 'IL' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+964', flag: '🇮🇶', label: 'IQ' },
  { code: '+98', flag: '🇮🇷', label: 'IR' },
  { code: '+354', flag: '🇮🇸', label: 'IS' },
  { code: '+39', flag: '🇮🇹', label: 'IT' },
  { code: '+962', flag: '🇯🇴', label: 'JO' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+254', flag: '🇰🇪', label: 'KE' },
  { code: '+82', flag: '🇰🇷', label: 'KR' },
  { code: '+965', flag: '🇰🇼', label: 'KW' },
  { code: '+961', flag: '🇱🇧', label: 'LB' },
  { code: '+370', flag: '🇱🇹', label: 'LT' },
  { code: '+352', flag: '🇱🇺', label: 'LU' },
  { code: '+212', flag: '🇲🇦', label: 'MA' },
  { code: '+373', flag: '🇲🇩', label: 'MD' },
  { code: '+382', flag: '🇲🇪', label: 'ME' },
  { code: '+52', flag: '🇲🇽', label: 'MX' },
  { code: '+60', flag: '🇲🇾', label: 'MY' },
  { code: '+234', flag: '🇳🇬', label: 'NG' },
  { code: '+31', flag: '🇳🇱', label: 'NL' },
  { code: '+47', flag: '🇳🇴', label: 'NO' },
  { code: '+64', flag: '🇳🇿', label: 'NZ' },
  { code: '+968', flag: '🇴🇲', label: 'OM' },
  { code: '+507', flag: '🇵🇦', label: 'PA' },
  { code: '+51', flag: '🇵🇪', label: 'PE' },
  { code: '+63', flag: '🇵🇭', label: 'PH' },
  { code: '+92', flag: '🇵🇰', label: 'PK' },
  { code: '+48', flag: '🇵🇱', label: 'PL' },
  { code: '+970', flag: '🇵🇸', label: 'PS' },
  { code: '+351', flag: '🇵🇹', label: 'PT' },
  { code: '+595', flag: '🇵🇾', label: 'PY' },
  { code: '+974', flag: '🇶🇦', label: 'QA' },
  { code: '+40', flag: '🇷🇴', label: 'RO' },
  { code: '+381', flag: '🇷🇸', label: 'RS' },
  { code: '+7', flag: '🇷🇺', label: 'RU' },
  { code: '+966', flag: '🇸🇦', label: 'SA' },
  { code: '+46', flag: '🇸🇪', label: 'SE' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+386', flag: '🇸🇮', label: 'SI' },
  { code: '+421', flag: '🇸🇰', label: 'SK' },
  { code: '+221', flag: '🇸🇳', label: 'SN' },
  { code: '+963', flag: '🇸🇾', label: 'SY' },
  { code: '+66', flag: '🇹🇭', label: 'TH' },
  { code: '+216', flag: '🇹🇳', label: 'TN' },
  { code: '+90', flag: '🇹🇷', label: 'TR' },
  { code: '+886', flag: '🇹🇼', label: 'TW' },
  { code: '+380', flag: '🇺🇦', label: 'UA' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' }, // Preserved your custom UAE label
  { code: '+44', flag: '🇬🇧', label: 'UK' },  // Preserved your custom UK label
  { code: '+1', flag: '🇺🇸', label: 'US/CA' }, // Preserved your custom US/CA label
  { code: '+598', flag: '🇺🇾', label: 'UY' },
  { code: '+58', flag: '🇻🇪', label: 'VE' },
  { code: '+84', flag: '🇻🇳', label: 'VN' },
  { code: '+967', flag: '🇾🇪', label: 'YE' },
  { code: '+27', flag: '🇿🇦', label: 'ZA' }
];

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

  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNum, setPhoneNum] = useState('');
  
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
  const { t } = useLanguage();

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

        // Parse Phone Number for UI
        let parsedCode = '+1';
        let parsedNum = userData.phone_number || '';
        if (userData.phone_number) {
          const match = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find(c => userData.phone_number.startsWith(c.code));
          if (match) {
            parsedCode = match.code;
            parsedNum = userData.phone_number.slice(match.code.length).trim();
          }
        }
        setPhoneCode(parsedCode);
        setPhoneNum(parsedNum);

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

        // 3. Hydrate Language from Cookies
        const savedLang = Cookies.get('language') || 'en';
        setLanguage(savedLang as 'en' | 'ar');

      } catch (error) {
        showAlert(t.common.error, 'Failed to load profile data.', 'error');
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
    
    // Save to cookies so server components (like layout.tsx) can read it
    Cookies.set('language', newLang, { path: '/' });
    
    // Force a full reload to apply RTL/LTR CSS direction and refetch all server data in new language
    window.location.reload();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Size (e.g., max 5MB) and Type
    if (file.size > 5 * 1024 * 1024) return showAlert(t.settings.alerts.fileTooLargeTitle, t.settings.alerts.fileTooLargeMsg, 'error');
    if (!file.type.startsWith('image/')) return showAlert(t.settings.alerts.invalidFileTitle, t.settings.alerts.invalidFileMsg, 'error');

    setIsUploadingImage(true);
    try {
      // Note: Backend must implement this endpoint to upload to GCS bucket: agent-platform-bucket-1
      const response = await uploadProfileImage(file);
      
      if (response && response.url) {
        const updatedProfile = { ...profileData, profile_image: response.url };
        setProfileData(updatedProfile);
        // Auto-save the profile so the image is immediately persisted
        await updateUserProfile(updatedProfile);
        showAlert(t.common.success, t.settings.alerts.uploadSuccess, 'success');
      }
    } catch (error: any) {
      showAlert(t.settings.alerts.uploadFailedTitle, error.response?.data?.detail || t.settings.alerts.uploadFailedMsg, 'error');
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
      showAlert(t.common.success, t.settings.alerts.removeSuccess, 'success');
    } catch (error: any) {
      showAlert(t.common.error, t.settings.alerts.removeFailed, 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    try {
      const payload = {
        ...profileData,
        phone_number: phoneNum.trim() ? `${phoneCode}${phoneNum.trim()}` : ''
      };
      await updateUserProfile(payload);
      showAlert(t.common.success, t.settings.alerts.profileSaveSuccess, 'success');
    } catch (error: any) {
      showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData.old_password) return showAlert(t.settings.alerts.reqPasswordTitle, t.settings.alerts.reqPasswordMsg, 'error');
    
    // Prepare Payload - Only send changed fields
    const payload: any = { old_password: accountData.old_password };
    if (accountData.new_email.trim() !== '') payload.new_email = accountData.new_email;
    if (accountData.new_password.trim() !== '') payload.new_password = accountData.new_password;

    setIsSavingAccount(true);
    try {
      await updateUserAccount(payload);
      showAlert(t.common.success, t.settings.alerts.accountSaveSuccess, 'success');
      if (payload.new_email) setCurrentEmail(payload.new_email);
      
      // Clear passwords from form on success
      setAccountData({ old_password: '', new_email: '', new_password: '' });
    } catch (error: any) {
      // Handle specific Edge Cases 
      if (error.response?.status === 401) showAlert(t.settings.alerts.authFailedTitle, t.settings.alerts.authFailedMsg, 'error');
      else if (error.response?.status === 409) showAlert(t.settings.alerts.conflictTitle, t.settings.alerts.conflictMsg, 'error');
      else showAlert(t.common.error, error.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const confirmDeleteAccount = () => {
    setConfirmDialog({
      isOpen: true,
      title: t.settings.alerts.deleteTitle,
      message: t.settings.alerts.deleteMsg,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showAlert(t.settings.alerts.actionNotAllowed, t.settings.alerts.actionNotAllowedMsg, 'error');
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
        <h1 className="text-2xl rtl:text-3xl font-bold flex items-center gap-2">
          <Settings className="text-indigo-600" /> {t.settings.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 rtl:text-lg">{t.settings.subtitle}</p>
      </div>

      <div className="space-y-6">
        
        {/* PROFILE SECTION */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><User size={20} /></div>
            <h2 className="text-lg font-bold">{t.settings.profileTitle}</h2>
          </div>
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="relative group">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center relative flex-shrink-0 transition-all">
                {profileData.profile_image && (profileData.profile_image.startsWith('http') || profileData.profile_image.startsWith('/')) ? (
                    <Image src={profileData.profile_image} alt="Profile" fill className="object-cover" />
                  ) : (
                    <User size={64} className="text-slate-400 dark:text-slate-500" />
                  )}
                  
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left flex-1 flex flex-col justify-center mt-2 sm:mt-0">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{t.settings.profileAvatar}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
                  <button 
                    onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Camera size={16} /> {t.settings.uploadImage}
                  </button>
                  {profileData.profile_image && (
                    <button onClick={handleRemoveImage} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={16} /> {t.settings.removeBtn}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 rtl:text-right">{t.settings.uploadDesc}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.firstName}</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.lastName}</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.position}</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} placeholder="e.g. Sales Manager" />
              </div>
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.phone}</label>
                <div className="flex gap-2">
                  <select 
                    className="w-1/3 px-2 sm:px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white cursor-pointer"
                    value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)}
                  >
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <input type="tel" className="w-2/3 px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={phoneNum} onChange={e => setPhoneNum(e.target.value)} placeholder="123 456 7890" />
                </div>
              </div>
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.country}</label>
                <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white cursor-pointer" value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})}>
                  <option value="" disabled>{t.settings.selectCountry}</option>
                  {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.gender}</label>
                <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={profileData.gender} onChange={e => setProfileData({...profileData, gender: e.target.value})}>
                  <option value="Male">{t.settings.genders.male}</option>
                  <option value="Female">{t.settings.genders.female}</option>
                  <option value="Other">{t.settings.genders.other}</option>
                  <option value="Prefer not to say">{t.settings.genders.preferNot}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.bio}</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white resize-none" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="A short bio about yourself..."></textarea>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingProfile} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${isSavingProfile ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md cursor-pointer'}`}>
                {isSavingProfile ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> {t.settings.savingBtn}</> : <><Save size={18} /> {t.settings.saveBtn}</>}
              </button>
            </div>
          </form>
        </div>

        {/* ACCOUNT SECURITY SECTION */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Shield size={20} /></div>
            <h2 className="text-lg font-bold">{t.settings.securityTitle}</h2>
          </div>
          <form onSubmit={handleSaveAccount} className="p-6 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t.settings.currentEmailDesc1}<strong className="text-slate-900 dark:text-white">{currentEmail}</strong>
                {t.settings.currentEmailDesc2}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.newEmail}</label>
                <input type="email" placeholder={t.settings.newEmailPlaceholder} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={accountData.new_email} onChange={e => setAccountData({...accountData, new_email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm rtl:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t.settings.newPassword}</label>
                <input type="password" minLength={8} placeholder={t.settings.newEmailPlaceholder} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:focus:outline-none text-slate-900 dark:text-white" value={accountData.new_password} onChange={e => setAccountData({...accountData, new_password: e.target.value})} />
              </div>
              <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-sm rtl:text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">{t.settings.currentPassword}</label>
                <input type="password" required placeholder={t.settings.currentPasswordPlaceholder} className="w-full md:w-1/2 px-4 py-2 border border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:outline-none text-slate-900 dark:text-white" value={accountData.old_password} onChange={e => setAccountData({...accountData, old_password: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingAccount || !accountData.old_password} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${isSavingAccount || !accountData.old_password ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 hover:shadow-md cursor-pointer'}`}>
                {isSavingAccount ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> {t.settings.verifyingBtn}</> : <><Shield size={18} /> {t.settings.updateSecurityBtn}</>}
              </button>
            </div>
          </form>
        </div>

        {/* PREFERENCES SECTION */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Settings size={20} /></div>
            <h2 className="text-lg font-bold">{t.settings.prefTitle}</h2>
          </div>
          <div className="p-6 space-y-4">
            
            {/* Theme Switcher */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm"><Moon size={20} /></div>
                <div>
                  <h4 className="text-sm rtl:text-base font-bold">{t.settings.appearance}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.settings.appearanceDesc}</p>
                </div>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg">
                <button onClick={() => handleThemeChange('light')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t.settings.light}</button>
                <button onClick={() => handleThemeChange('dark')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t.settings.dark}</button>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm"><Globe size={20} /></div>
                <div>
                  <h4 className="text-sm rtl:text-base font-bold">{t.settings.language}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.settings.languageDesc}</p>
                </div>
              </div>
              <select value={language} onChange={handleLanguageChange} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 cursor-pointer transition-colors">
                <option value="en">{t.settings.prefTitle.includes('تفضيلات') ? 'الإنجليزية (English)' : 'English (US)'}</option>
                <option value="ar">{t.settings.prefTitle.includes('تفضيلات') ? 'العربية' : 'Arabic (العربية)'}</option>
              </select>
            </div>

          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
          <div>
            <h3 className="text-lg rtl:text-xl font-bold text-red-700 dark:text-red-500 flex items-center gap-2"><Trash2 size={20} /> {t.settings.dangerZone}</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 rtl:text-right">{t.settings.dangerDesc}</p>
          </div>
          <button onClick={confirmDeleteAccount} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer">
            {t.settings.deleteAccount}
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
                {t.common.okay}
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
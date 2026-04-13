'use client';

import { logout } from '@/services/auth';
import { LogOut } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LogoutButton() {
  const { t } = useLanguage();

  return (
    <button
      onClick={() => logout()}
      className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
    >
      <LogOut size={20} />
      <span>{t.common.logout}</span>
    </button>
  );
}

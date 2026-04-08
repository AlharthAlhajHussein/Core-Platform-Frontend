'use client';

import { logout } from '@/services/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
    >
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  );
}

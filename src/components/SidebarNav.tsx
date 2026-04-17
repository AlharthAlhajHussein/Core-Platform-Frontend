'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bot, MessageSquare, Database, Layers, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SidebarNav({ role, onClose }: { role: string; onClose?: () => void }) {
  // usePathname gives us the exact current URL (e.g., "/dashboard/sections")
  const pathname = usePathname();
  const { t } = useLanguage();

  // Centralized configuration for our sidebar links and their required roles
  const navLinks = [
    { key: 'overview', href: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { key: 'sections', href: '/dashboard/sections', icon: Layers, roles: ['OWNER'] },
    { key: 'users', href: '/dashboard/users', icon: Users, roles: ['OWNER', 'SUPERVISOR'] },
    { key: 'agents', href: '/dashboard/agents', icon: Bot, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { key: 'knowledge', href: '/dashboard/knowledge-buckets', icon: Database, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { key: 'conversations', href: '/dashboard/conversations', icon: MessageSquare, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { key: 'settings', href: '/dashboard/settings', icon: Settings, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navLinks
        .filter((link) => link.roles.includes(role)) // Apply RBAC security
        .map((link) => {
          const Icon = link.icon;
          // Check if this link is the currently active page
          const isActive = pathname === link.href;
          // Retrieve the translated name from our dictionary using the key
          const name = t.sidebar[link.key as keyof typeof t.sidebar];
          
          return (
            <Link key={link.key} href={link.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 text-sm rtl:text-base font-medium rtl:font-bold rounded-lg transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`}>
              <Icon size={20} /> {name}
            </Link>
          );
        })}
    </nav>
  );
}
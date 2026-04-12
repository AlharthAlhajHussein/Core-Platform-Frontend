'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bot, MessageSquare, Database, Layers, Settings } from 'lucide-react';

export default function SidebarNav({ role }: { role: string }) {
  // usePathname gives us the exact current URL (e.g., "/dashboard/sections")
  const pathname = usePathname();

  // Centralized configuration for our sidebar links and their required roles
  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { name: 'Sections', href: '/dashboard/sections', icon: Layers, roles: ['OWNER'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['OWNER', 'SUPERVISOR'] },
    { name: 'AI Agents', href: '/dashboard/agents', icon: Bot, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-buckets', icon: Database, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['OWNER', 'SUPERVISOR', 'EMPLOYEE'] },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navLinks
        .filter((link) => link.roles.includes(role)) // Apply RBAC security
        .map((link) => {
          const Icon = link.icon;
          // Check if this link is the currently active page
          const isActive = pathname === link.href;
          
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`}>
              <Icon size={20} /> {link.name}
            </Link>
          );
        })}
    </nav>
  );
}
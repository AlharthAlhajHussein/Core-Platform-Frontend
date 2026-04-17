'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import SidebarNav from './SidebarNav';
import LogoutButton from './LogoutButton';

export default function Sidebar({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar automatically when the user navigates on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative rounded-md overflow-hidden bg-slate-900">
            <Image src="/my_logo.png" alt="Logo" fill sizes="32px" className="object-cover" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">AI Agents Platform</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:static inset-y-0 start-0 z-50 w-64 bg-white dark:bg-slate-950 border-r rtl:border-l rtl:border-r-0 border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0'
        }`}
      >
        {/* Logo Area (Desktop & Mobile Sidebar Header) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-md overflow-hidden bg-slate-900">
              <Image src="/my_logo.png" alt="Logo" fill sizes="32px" className="object-cover" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">AI Agents Platform</span>
          </div>
          <button
            className="md:hidden p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <SidebarNav role={role} onClose={() => setIsOpen(false)} />

        {/* Logout Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
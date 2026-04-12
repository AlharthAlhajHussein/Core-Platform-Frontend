import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
import SidebarNav from '@/components/SidebarNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Extra Security: If someone accesses /dashboard without a valid token payload, kick them out.
  if (!session) {
    redirect('/login');
  }

  const role = session.role || 'EMPLOYEE';

  // Define the navigation links. We conditionally render them based on the role!
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-200">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-md overflow-hidden bg-slate-900">
              <Image src="/my_logo.png" alt="Logo" fill sizes="32px" className="object-cover" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">AI Agents Platform</span>
          </div>
        </div>

        {/* Navigation Links */}
        <SidebarNav role={role} />

        {/* Logout Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
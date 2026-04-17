import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Extra Security: If someone accesses /dashboard without a valid token payload, kick them out.
  if (!session) {
    redirect('/login');
  }

  const role = session.role || 'EMPLOYEE';

  // Define the navigation links. We conditionally render them based on the role!
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-200">
      
      <Sidebar role={role} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
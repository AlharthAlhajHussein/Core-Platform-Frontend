import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const session = await getSession();

  // 🛡️ Server-Side RBAC Check: Employees are not allowed here!
  if (session?.role === 'EMPLOYEE' || !session) {
    redirect('/dashboard');
  }

  return (
    <UsersClient 
      currentUserRole={session.role as 'OWNER' | 'SUPERVISOR'} 
      currentUserId={session.sub} 
    />
  );
}

import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AgentsClient from './AgentsClient';

export default async function AgentsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Pass the verified role down to the client to dynamically adjust the UI permissions
  return <AgentsClient currentUserRole={session.role as 'OWNER' | 'SUPERVISOR' | 'EMPLOYEE'} />;
}
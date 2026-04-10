import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import KnowledgeClient from './KnowledgeClient';

export default async function KnowledgePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Pass the verified role down to the client to dynamically adjust the UI permissions
  return <KnowledgeClient currentUserRole={session.role as 'OWNER' | 'SUPERVISOR' | 'EMPLOYEE'} />;
}
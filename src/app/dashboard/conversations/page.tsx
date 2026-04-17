import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ConversationsClient from './ConversationsClient';

export const metadata = {
  title: 'Live Conversations | Agents Platform',
};

export default async function ConversationsPage() {
  const session = await getSession();

  // Extra Security Route Protection
  if (!session) redirect('/login');

  return <ConversationsClient />;
}
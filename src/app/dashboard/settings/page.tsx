import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();

  // Extra Security Check
  if (!session) {
    redirect('/login');
  }

  return <SettingsClient currentUserId={session.sub} currentUserRole={session.role as string} />;
}
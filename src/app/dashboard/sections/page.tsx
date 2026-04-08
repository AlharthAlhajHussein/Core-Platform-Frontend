import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SectionsClient from './SectionsClient';

export default async function SectionsPage() {
  const session = await getSession();

  // 🛡️ Server-Side RBAC Check: If a Supervisor or Employee types this URL, kick them out!
  if (session?.role !== 'OWNER') {
    redirect('/dashboard');
  }

  // If they are an OWNER, render the interactive client component.
  return <SectionsClient />;
}

import { getSession } from '@/lib/session';
import OverviewClient from './OverviewClient';

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role || 'EMPLOYEE';

  return (
    <OverviewClient role={role} />
  );
}

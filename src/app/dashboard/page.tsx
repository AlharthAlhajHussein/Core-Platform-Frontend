import { getSession } from '@/lib/session';
import { Users, Bot, MessageSquare, Database, Layers, AlertCircle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role || 'EMPLOYEE';

  // 💡 Note: These should eventually be fetched from a new FastAPI `GET /api/v1/stats` endpoint!
  const ownerStats = [
    { label: 'Total Sections', value: '2', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Total Users', value: '8', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Agents', value: '16', icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Suspended Agents', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Completed Convs', value: '1k', icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Human Handovers', value: '29', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Knowledge Buckets', value: '5', icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const supervisorStats = [
    { label: 'Total Users', value: '8', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Agents', value: '16', icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Suspended Agents', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Completed Convs', value: '1k', icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Human Handovers', value: '29', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Knowledge Buckets', value: '5', icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const employeeStats = [
    { label: 'My Active Agents', value: '3', icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'My Suspended Agents', value: '0', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Assigned Convs', value: '24', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Assigned KBs', value: '2', icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  let statsToDisplay = employeeStats;
  if (role === 'OWNER') statsToDisplay = ownerStats;
  else if (role === 'SUPERVISOR') statsToDisplay = supervisorStats;

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! You are logged in as an <span className="font-semibold text-blue-600">{role}</span>.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statsToDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity / Placeholders */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {role === 'OWNER' && (
            <p className="text-slate-600">
              As an Owner, you can navigate to the <strong>Sections</strong> or <strong>Team Users</strong> tabs on the left to manage your company hierarchy.
            </p>
          )}
          {role === 'SUPERVISOR' && (
            <p className="text-slate-600">
              As a Supervisor, you can assign Agents to Employees within your section by visiting the <strong>AI Agents</strong> tab.
            </p>
          )}
          {role === 'EMPLOYEE' && (
            <p className="text-slate-600">
              As an Employee, check your <strong>Conversations</strong> tab to handle escalations and live chats for your assigned agents.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

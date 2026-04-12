import { getSession } from '@/lib/session';
import { Users, Bot, MessageSquare, Database, Layers, AlertCircle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role || 'EMPLOYEE';

  // 💡 Note: These should eventually be fetched from a new FastAPI `GET /api/v1/stats` endpoint!
  const ownerStats = [
    { label: 'Total Sections', value: '2', icon: Layers, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Total Users', value: '8', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Agents', value: '16', icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Suspended Agents', value: '3', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Completed Convs', value: '1k', icon: MessageSquare, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Human Handovers', value: '29', icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Knowledge Buckets', value: '5', icon: Database, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ];

  const supervisorStats = [
    { label: 'Total Users', value: '8', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Agents', value: '16', icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Suspended Agents', value: '3', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Completed Convs', value: '1k', icon: MessageSquare, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Human Handovers', value: '29', icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Knowledge Buckets', value: '5', icon: Database, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ];

  const employeeStats = [
    { label: 'My Active Agents', value: '3', icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'My Suspended Agents', value: '0', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Assigned Convs', value: '24', icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Assigned KBs', value: '2', icon: Database, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ];

  let statsToDisplay = employeeStats;
  if (role === 'OWNER') statsToDisplay = ownerStats;
  else if (role === 'SUPERVISOR') statsToDisplay = supervisorStats;

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back! You are logged in as an <span className="font-semibold text-blue-600 dark:text-blue-400">{role}</span>.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statsToDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${stat.bg}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity / Placeholders */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-colors">
          {role === 'OWNER' && (
            <p className="text-slate-600 dark:text-slate-300">
              As an Owner, you can navigate to the <strong className="text-slate-900 dark:text-white">Sections</strong> or <strong className="text-slate-900 dark:text-white">Team Users</strong> tabs on the left to manage your company hierarchy.
            </p>
          )}
          {role === 'SUPERVISOR' && (
            <p className="text-slate-600 dark:text-slate-300">
              As a Supervisor, you can assign Agents to Employees within your section by visiting the <strong className="text-slate-900 dark:text-white">AI Agents</strong> tab.
            </p>
          )}
          {role === 'EMPLOYEE' && (
            <p className="text-slate-600 dark:text-slate-300">
              As an Employee, check your <strong className="text-slate-900 dark:text-white">Conversations</strong> tab to handle escalations and live chats for your assigned agents.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

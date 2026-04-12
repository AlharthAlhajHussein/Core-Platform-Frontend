'use client';

import { useState, useEffect } from 'react';
import { getOverviewStats } from '@/services/overview';
import { Users, Bot, MessageSquare, Database, Layers, AlertCircle, Activity, Zap, MessageCircle } from 'lucide-react';

interface OverviewClientProps {
  role: string;
}

export default function OverviewClient({ role }: OverviewClientProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOverviewStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load overview statistics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Formats large numbers nicely (e.g., 12050 -> 12.1k)
  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  };

  // Map the 10 API properties accurately into beautiful UI cards
  const statCards = [
    { key: 'total_sections', label: 'Total Sections', icon: Layers, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { key: 'total_users', label: 'Total Users', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { key: 'active_agents', label: 'Active Agents', icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { key: 'suspended_agents', label: 'Suspended Agents', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    { key: 'active_convs', label: 'Active Convs', icon: Activity, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    { key: 'completed_convs', label: 'Completed Convs', icon: MessageSquare, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { key: 'human_handovers', label: 'Human Handovers', icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { key: 'knowledge_bases', label: 'Knowledge Bases', icon: Database, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { key: 'total_messages_sent', label: 'Messages Sent', icon: MessageCircle, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700/50' },
    { key: 'total_tokens_used', label: 'Tokens Used', icon: Zap, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back! You are logged in as an <span className="font-semibold text-indigo-600 dark:text-indigo-400">{role}</span>.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading ? (
          // Edge Case: Loading Skeleton Cards
          Array.from({ length: 10 }).map((_, i) => (
            <div key={`sk-${i}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-pulse flex items-center justify-between">
              <div className="space-y-3 flex-1 mr-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
          ))
        ) : (
          // Render Real Data
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            const rawValue = stats?.[stat.key] || 0;
            const displayValue = formatNumber(rawValue);

            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide truncate pr-2">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white" title={rawValue.toLocaleString()}>
                      {displayValue}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors group-hover:scale-105 transform duration-200 ${stat.bg}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
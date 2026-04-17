'use client';

import { useState, useEffect } from 'react';
import { getOverviewStats } from '@/services/overview';
import { getCurrentUser } from '@/services/users';
import { Users, Bot, MessageSquare, Database, Layers, AlertCircle, Activity, Zap, MessageCircle, FileText, Image as ImageIcon, Mic } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface OverviewClientProps {
  role: string;
}

// --- Custom SVGs for WhatsApp and Telegram ---
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.525.146-.18.194-.301.297-.496.1-.21.049-.375-.025-.525-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.285-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.36zM12.014 20.021h-.006c-1.575 0-3.12-.42-4.47-1.215l-.315-.195-3.33.87.885-3.24-.21-.33a8.16 8.16 0 0 1-1.26-4.38c0-4.515 3.675-8.19 8.19-8.19 2.19 0 4.245.855 5.79 2.4 1.545 1.545 2.4 3.6 2.4 5.79-.015 4.5-3.69 8.19-8.204 8.19zM12.014 2.016A9.975 9.975 0 0 0 2.04 11.985c0 1.605.42 3.165 1.2 4.53l-1.635 5.985 6.12-1.605a9.92 9.92 0 0 0 4.29.96h.006c5.505 0 9.99-4.485 9.99-9.99 0-2.67-1.05-5.175-2.94-7.065-1.89-1.89-4.41-2.925-7.071-2.925v.015z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
  </svg>
);

export default function OverviewClient({ role }: OverviewClientProps) {
  const [stats, setStats] = useState<any>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [data, user] = await Promise.all([getOverviewStats(), getCurrentUser()]);
        setStats(data);
        setFirstName(user.first_name || '');
      } catch (err: any) {
        setError(err.response?.data?.detail || t.overview.loadError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  };

  const statCards = [
    { key: 'total_sections', label: t.overview.totalSections, icon: Layers, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { key: 'total_users', label: t.overview.totalUsers, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { key: 'active_agents', label: t.overview.activeAgents, icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { key: 'suspended_agents', label: t.overview.suspendedAgents, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    { key: 'active_convs', label: t.overview.activeConvs, icon: Activity, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    { key: 'completed_convs', label: t.overview.completedConvs, icon: MessageSquare, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { key: 'human_handovers', label: t.overview.humanHandovers, icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { key: 'knowledge_bases', label: t.overview.knowledgeBases, icon: Database, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { key: 'total_messages_sent', label: t.overview.totalMessages, icon: MessageCircle, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700/50' },
    { key: 'total_tokens_used', label: t.overview.totalTokens, icon: Zap, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  const visibleStatCards = statCards.filter(stat => 
    !(stat.key === 'total_users' && role === 'EMPLOYEE')
  );

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl rtl:text-3xl font-bold text-slate-900 dark:text-white">{t.overview.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 rtl:text-lg">
          {t.overview.subtitleRole}<span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.common.roles[role as keyof typeof t.common.roles] || role} {firstName}</span>
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
          Array.from({ length: visibleStatCards.length }).map((_, i) => (
            <div key={`sk-${i}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-pulse flex items-center justify-between">
              <div className="space-y-3 flex-1 mr-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
          ))
        ) : (
          visibleStatCards.map((stat, index) => {
            const Icon = stat.icon;
            const rawValue = stats?.[stat.key] || 0;
            const displayValue = formatNumber(rawValue);

            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs rtl:text-sm font-semibold rtl:font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide truncate pr-2">
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

      {/* --- TRANSLATED: Supported Channels Section --- */}
      <div className="mt-12 mb-4">
        <h2 className="text-xl rtl:text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {t.overview.supportedChannels}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WhatsApp Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300 dark:hover:border-green-600 group">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl group-hover:scale-105 transition-transform duration-200">
              <WhatsAppIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.overview.whatsappTitle}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {t.overview.whatsappDesc}
              </p>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                  <FileText size={14} /> {t.overview.badgeText}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                  <Mic size={14} /> {t.overview.badgeAudio}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                  <ImageIcon size={14} /> {t.overview.badgeImages}
                </span>
              </div>
            </div>
          </div>

          {/* Telegram Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 group">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-[#2AABEE] dark:text-[#38bdf8] rounded-2xl group-hover:scale-105 transition-transform duration-200">
              <TelegramIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.overview.telegramTitle}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {t.overview.telegramDesc}
              </p>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                  <FileText size={14} /> {t.overview.badgeText}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                  <Mic size={14} /> {t.overview.badgeAudio}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                  <ImageIcon size={14} /> {t.overview.badgeImages}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
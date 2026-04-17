'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getConversations, getConversation, updateConversationStatus, evaluateConversation } from '@/services/conversations';
import { getSections } from '@/services/sections';
import { getUsers } from '@/services/users';
import { getAgents } from '@/services/agents';
import Cookies from 'js-cookie';
import api from '@/lib/api'; // Added API import for /users/me
import { Search, CheckCircle, AlertCircle, Info, X, Bot, User, MessageSquare, Star, ArrowLeft, ArrowRight, Layers, Shield, CheckCheck } from 'lucide-react';

interface Conversation {
  id: string;
  platform: string;
  sender_id: string;
  status: 'ACTIVE' | 'PENDING_HUMAN' | 'COMPLETED';
  language: string;
  last_message_preview: string;
  last_activity_at: string;
  agent_id: string;
  agent_name: string;
  section_id: string;
  section_name: string;
  evaluation: string | null;
  evaluation_notes: string | null;
  assigned_supervisors?: string[] | null;
  assigned_employees?: string[] | null;
}

interface Message {
  id: string;
  sender_type: string;
  text: string | null;
  media_url: string | null;
  timestamp: string;
}

// --- NEW TEXT FORMATTER ---
const formatMessageText = (text: string | null) => {
  if (!text) return null;
  
  // FIXED: .trim() removes invisible line breaks sent by the backend API 
  // that were causing the ugly empty vertical gap above the time.
  const normalizedText = text.replace(/\\n/g, '\n').trim();
  
  return normalizedText.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    
    return (
      <React.Fragment key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export default function ConversationsClient() {
  const { t } = useLanguage();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null); // NEW: Track current user role
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterSection, setFilterSection] = useState('ALL');
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterAgent, setFilterAgent] = useState('ALL');
  
  // Dropdown Options
  const [sections, setSections] = useState<{id: string, name: string}[]>([]);
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = useState<{id: string, first_name: string, last_name: string}[]>([]);
  
  // Eval Modal
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalRating, setEvalRating] = useState('GOOD');
  const [evalNotes, setEvalNotes] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Alert Dialog
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'info' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  // --- NEW: Fetch Authenticated User to configure RBAC Filters ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await api.get('/users/me');
        const me = res.data;
        setCurrentUserRole(me.current_role);

        // Owners fetch all sections; Supervisors/Employees use their assigned sections
        if (me.current_role === 'OWNER' || me.is_platform_admin) {
          const allSections = await getSections();
          setSections(allSections);
        } else {
          setSections(me.sections || []);
        }
      } catch (error) {
        console.error('Failed to load user context:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Users and Agents based on Section and Role
  useEffect(() => {
    // Prevent EMPLOYEE from triggering GET /users and getting a 403 error
    if (currentUserRole && currentUserRole !== 'EMPLOYEE') {
      getUsers(filterSection !== 'ALL' ? filterSection : undefined)
        .then(setUsers)
        .catch(() => {});
    }
    
    // Everyone can fetch agents
    getAgents(filterSection !== 'ALL' ? filterSection : undefined)
      .then(setAgents)
      .catch(() => {});
  }, [filterSection, currentUserRole]);

  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      try {
        const data = await getConversations({
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
          platform: filterPlatform !== 'ALL' ? filterPlatform : undefined,
          section_id: filterSection !== 'ALL' ? filterSection : undefined,
          user_id: filterUser !== 'ALL' ? filterUser : undefined,
          agent_id: filterAgent !== 'ALL' ? filterAgent : undefined,
        });
        setConversations(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, [filterStatus, filterPlatform, filterSection, filterUser, filterAgent]);

  useEffect(() => {
    if (!selectedConvId) return;

    let isMounted = true;
    const fetchChat = async () => {
      setLoadingChat(true);
      try {
        const data = await getConversation(selectedConvId);
        if (isMounted) {
          setSelectedConv(data.conversation);
          setMessages(data.messages || []);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        if (isMounted) setLoadingChat(false);
      }
    };

    fetchChat();

    const token = Cookies.get('access_token');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const wsBaseUrl = baseUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl}/conversations/${selectedConvId}/ws?token=${token}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message' && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    };

    return () => {
      isMounted = false;
      if (ws.readyState === 1 || ws.readyState === 0) {
        ws.close();
      }
    };
  }, [selectedConvId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const data = await updateConversationStatus(selectedConvId!, newStatus);
      setSelectedConv(data);
      setConversations((prev) => prev.map(c => c.id === selectedConvId ? { ...c, status: newStatus as any } : c));
      showAlert(t.common.success, t.conversations.alerts.statusSuccess, 'success');
    } catch (err: any) {
      showAlert(t.common.error, err.response?.data?.detail || t.common.error, 'error');
    }
  };

  const submitEvaluation = async () => {
    if (evalRating === 'OTHERS' && !evalNotes.trim()) {
      showAlert(t.common.error, t.conversations.alerts.notesRequired, 'error');
      return;
    }
    setIsEvaluating(true);
    try {
      const data = await evaluateConversation(selectedConvId!, evalRating, evalNotes.trim() || undefined);
      setSelectedConv(data);
      showAlert(t.common.success, t.conversations.alerts.evalSuccess, 'success');
      setIsEvalModalOpen(false);
    } catch (err: any) {
      showAlert(t.common.error, err.response?.data?.detail || t.common.error, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.sender_id.includes(search) || c.last_message_preview?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString() 
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : d.toLocaleDateString();
  };

  const renderMedia = (url: string) => {
    const lowerUrl = url.toLowerCase();
    const isImage = /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/.test(lowerUrl) || lowerUrl.includes('images') || lowerUrl.includes('photo');
    const isVideo = /\.(mp4|webm|avi|mov)(\?.*)?$/.test(lowerUrl);

    if (isImage) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block mb-1.5 overflow-hidden rounded-lg w-fit">
          <img 
            src={url} 
            alt="Media content" 
            className="rounded-lg transition-opacity hover:opacity-90 cursor-zoom-in" 
            loading="lazy"
            style={{ maxHeight: '400px', maxWidth: '250px', width: 'auto', height: 'auto' }}
          />
        </a>
      );
    }
    
    if (isVideo) {
      return (
        <video src={url} controls className="rounded-lg mb-1.5 bg-black w-fit" style={{ maxHeight: '260px', maxWidth: '260px', width: 'auto' }} />
      );
    }
    
    return <audio src={url} controls className="w-full max-w-[240px] mb-1.5 h-10 rounded-full outline-none" />;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cleanStatus = status?.replace?.('ConversationStatus.', '') || status;
    const styles = {
      ACTIVE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      PENDING_HUMAN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      COMPLETED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    };
    const label = t.conversations.statusTypes[cleanStatus as keyof typeof t.conversations.statusTypes] || cleanStatus;
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[cleanStatus as keyof typeof styles] || styles.COMPLETED}`}>{label}</span>;
  };

  const formatSenderId = (platform?: string, senderId?: string) => {
    if (!senderId) return 'User';
    if (platform === 'telegram' && !senderId.startsWith('@')) return `@${senderId}`;
    return senderId;
  };

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto h-full flex flex-col">
      {!selectedConvId && (
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl rtl:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <MessageSquare className="text-indigo-600" /> {t.conversations.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 rtl:text-lg">{t.conversations.subtitle}</p>
        </div>
      )}

      <div className={`flex-1 flex text-slate-900 dark:text-slate-100 min-h-[500px] ${!selectedConvId ? 'h-[calc(100vh-12rem)]' : 'h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]'}`}>
        {!selectedConvId ? (
          <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
            {/* Overview Search & Filters */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="relative w-full max-w-[180px] sm:max-w-[200px] flex-shrink-0">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input 
                  type="text" placeholder={t.conversations.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 rtl:pr-12 rtl:pl-4 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
                <select value={filterSection} onChange={(e) => { setFilterSection(e.target.value); setFilterUser('ALL'); setFilterAgent('ALL'); }} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 min-w-[130px]">
                  <option value="ALL">{t.users.filterAll}</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 min-w-[130px]">
                  <option value="ALL">{t.conversations.filterAllAgents}</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                
                {/* --- NEW: Hide User Filter from Employees --- */}
                {currentUserRole !== 'EMPLOYEE' && (
                  <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 min-w-[130px]">
                    <option value="ALL">{t.conversations.filterAllUsers}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                  </select>
                )}

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 min-w-[130px]">
                  <option value="ALL">{t.conversations.filterAllStatuses}</option>
                  <option value="ACTIVE">{t.conversations.statusTypes.ACTIVE}</option>
                  <option value="PENDING_HUMAN">{t.conversations.statusTypes.PENDING_HUMAN}</option>
                  <option value="COMPLETED">{t.conversations.statusTypes.COMPLETED}</option>
                </select>
                <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 min-w-[130px]">
                  <option value="ALL">{t.conversations.filterAllPlatforms}</option>
                  <option value="whatsapp">{t.conversations.whatsapp}</option>
                  <option value="telegram">{t.conversations.telegram}</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingList ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400 mt-10">
                  <MessageSquare className="mx-auto mb-4 opacity-50" size={48} />
                  <p className="font-semibold text-lg">{t.conversations.noConversations}</p>
                  <p className="text-sm mt-1">{t.conversations.noConversationsSub}</p>
                </div>
              ) : (
                <div className="p-2 sm:p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/20 min-h-full">
                  {filteredConversations.map(conv => (
                    <button key={conv.id} onClick={() => setSelectedConvId(conv.id)} className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group">
                      <div className="flex items-start sm:items-center gap-4 min-w-0 w-full">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/40 dark:group-hover:text-indigo-400 transition-colors"><User size={24} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">{formatSenderId(conv.platform, conv.sender_id)}</h4>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600"><Bot size={10} /> {conv.agent_name}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600"><Layers size={10} /> {conv.section_name}</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">{conv.last_message_preview || 'Media message'}</p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 flex-shrink-0 mt-2 sm:mt-0 border-t border-slate-100 dark:border-slate-700 sm:border-0 pt-3 sm:pt-0">
                        <StatusBadge status={conv.status} />
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{formatDate(conv.last_activity_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors relative">
            {selectedConv && (
              <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 z-10 shadow-sm sticky top-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setSelectedConvId(null); setSelectedConv(null); setMessages([]); }} className="p-2 -ml-2 rtl:-mr-2 rtl:ml-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors cursor-pointer">
                      <ArrowLeft className="rtl:hidden" size={24} />
                      <ArrowRight className="hidden rtl:block" size={24} />
                    </button>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{formatSenderId(selectedConv.platform, selectedConv.sender_id)}</h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5"><Bot size={12} /> {selectedConv.agent_name} • {selectedConv.platform === 'whatsapp' ? t.conversations.whatsapp : t.conversations.telegram}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <select value={selectedConv.status?.replace?.('ConversationStatus.', '') || selectedConv.status} onChange={(e) => handleStatusChange(e.target.value)} className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors">
                      <option value="ACTIVE">{t.conversations.statusTypes.ACTIVE}</option>
                      <option value="PENDING_HUMAN">{t.conversations.statusTypes.PENDING_HUMAN}</option>
                      <option value="COMPLETED">{t.conversations.statusTypes.COMPLETED}</option>
                    </select>
                    <button onClick={() => setIsEvalModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors shadow-sm cursor-pointer"><Star size={14} /> {t.conversations.evaluateBtn}</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 telegram-chat-bg" dir="ltr">
                  {loadingChat ? (
                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isOutgoing = msg.sender_type === 'AI' || msg.sender_type === 'SenderType.AI' || msg.sender_type === 'AGENT' || msg.sender_type === 'SenderType.AGENT';
                        
                        return (
                          <div key={msg.id || index} className={`flex w-full mb-2.5 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            
                            <div 
                              className={`relative w-fit min-w-[100px] max-w-[85%] lg:max-w-[65%] flex flex-col shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${
                                isOutgoing 
                                  ? 'telegram-bubble-out rounded-2xl rounded-br-none rtl:rounded-br-2xl rtl:rounded-bl-none text-slate-900 dark:text-white' 
                                  : 'telegram-bubble-in rounded-2xl rounded-bl-none rtl:rounded-bl-2xl rtl:rounded-br-none text-slate-900 dark:text-white'
                              }`}
                            >
                              
                              <div className="px-3 pt-2 pb-2 flex flex-col w-full relative">
                                
                                {/* Sender Label */}
                                <div 
                                  className="flex items-center gap-1.5 mb-1 text-[12px] font-bold self-start"
                                  style={{ color: isOutgoing ? (isDarkMode ? '#78A1CC' : '#4FA85D') : (isDarkMode ? '#64B5EF' : '#3390EC') }}
                                >
                                  {isOutgoing ? (msg.sender_type.includes('AGENT') ? 'Agent' : selectedConv.agent_name || 'AI Agent') : formatSenderId(selectedConv.platform, selectedConv.sender_id)}
                                </div>
                                
                                {msg.media_url && renderMedia(msg.media_url)}
                                
                                {msg.text ? (
                                  <>
                                    <div className="text-[14.5px] leading-relaxed break-words w-full" dir="auto">
                                      {formatMessageText(msg.text)}
                                    </div>
                                    
                                    <div className="flex flex-row justify-end w-full mt-0.5" dir="ltr">
                                      <span 
                                        className="flex flex-row items-center gap-1 text-[10.5px] whitespace-nowrap cursor-default"
                                        style={{ color: isOutgoing ? (isDarkMode ? '#78A1CC' : '#4FA85D') : (isDarkMode ? '#6B7D90' : '#A1AAB3') }}
                                      >
                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {isOutgoing && <CheckCheck size={14} style={{ color: isDarkMode ? '#5EB5F7' : '#4FA85D' }} />}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  msg.media_url && (
                                    <span 
                                      className="absolute bottom-2 right-3 text-[10px] flex flex-row items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 text-white shadow-sm"
                                      dir="ltr"
                                    >
                                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      {isOutgoing && <CheckCheck size={14} className="text-white" />}
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} className="h-2" />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isEvalModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-transparent dark:border-slate-700">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.conversations.evalModalTitle}</h3>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.conversations.evalLabel}</label>
                <select value={evalRating} onChange={(e) => setEvalRating(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer font-medium">
                  {Object.entries(t.conversations.evalTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label as string}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.conversations.notesLabel}</label>
                <textarea value={evalNotes} onChange={(e) => setEvalNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-600 focus:outline-none" placeholder={t.conversations.notesPlaceholder}></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsEvalModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer">{t.common.cancel}</button>
              <button onClick={submitEvaluation} disabled={isEvaluating} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer">
                {isEvaluating ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> {t.conversations.evaluatingBtn}</> : t.conversations.evalSubmitBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {alertDialog.type === 'success' && <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><CheckCircle size={18} /></div>}
                {alertDialog.type === 'error' && <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400"><AlertCircle size={18} /></div>}
                {alertDialog.type === 'info' && <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><Info size={18} /></div>}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{alertDialog.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 mt-2">{alertDialog.message}</p>
              <button onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))} className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm cursor-pointer">{t.common.okay}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { Bot, MessageSquare, Database, Server, ShieldCheck, Users, Lock, ChevronRight, Mail, Phone, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { homeTranslations } from '@/lib/i18n/homeTranslations';

// --- Custom Social Brand Icons ---
const FacebookIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>;
const LinkedInIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const WhatsAppIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.525.146-.18.194-.301.297-.496.1-.21.049-.375-.025-.525-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.285-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.36zM12.014 20.021h-.006c-1.575 0-3.12-.42-4.47-1.215l-.315-.195-3.33.87.885-3.24-.21-.33a8.16 8.16 0 0 1-1.26-4.38c0-4.515 3.675-8.19 8.19-8.19 2.19 0 4.245.855 5.79 2.4 1.545 1.545 2.4 3.6 2.4 5.79-.015 4.5-3.69 8.19-8.204 8.19zM12.014 2.016A9.975 9.975 0 0 0 2.04 11.985c0 1.605.42 3.165 1.2 4.53l-1.635 5.985 6.12-1.605a9.92 9.92 0 0 0 4.29.96h.006c5.505 0 9.99-4.485 9.99-9.99 0-2.67-1.05-5.175-2.94-7.065-1.89-1.89-4.41-2.925-7.071-2.925v.015z"/></svg>;
const TelegramIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>;
const YouTubeIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const InstagramIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
const XTwitterIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;

// --- Supported Languages Definition ---
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentLang, setCurrentLang] = useState('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // --- Initial Load (Theme & Language) ---
  useEffect(() => {
    setMounted(true);
    
    // Theme Logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      if (prefersDark) document.documentElement.classList.add('dark');
    }

    // Language Logic
    const savedLang = Cookies.get('language') || 'en';
    setCurrentLang(savedLang);

    // Click outside to close Language Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (code: string) => {
    Cookies.set('language', code, { path: '/' });
    setCurrentLang(code);
    setLangDropdownOpen(false);
  };

  // Get translations based on current language
  const t = homeTranslations[currentLang as keyof typeof homeTranslations] || homeTranslations['en'];
  const activeLangDef = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const isRTL = currentLang === 'ar';

  return (
    // Apply dir="rtl" to the main wrapper if Arabic is selected
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-white dark:bg-slate-900 selection:bg-indigo-500 selection:text-white font-sans transition-colors duration-300">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-12 relative flex-shrink-0 bg-indigo-600 rounded-xl overflow-hidden p-1 shadow-lg shadow-indigo-500/30">
              <Image src="/my_logo.png" alt="Platform Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block transition-colors duration-300">
              <span className="text-indigo-600 dark:text-indigo-400">{t.nav.platform}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Language Dropdown */}
            {mounted && (
              <div className="relative" ref={langDropdownRef}>
                <button 
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Globe size={18} className="hidden sm:block" />
                  <span className="text-base leading-none">{activeLangDef.flag}</span>
                  <span className="hidden sm:inline font-semibold text-sm mx-1">{activeLangDef.label}</span>
                  <ChevronDown size={14} className="hidden sm:block opacity-70" />
                </button>

                {langDropdownOpen && (
                  <div className={`absolute top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleLanguageChange(l.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${currentLang === l.code ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-700 dark:text-slate-300 font-medium'}`}
                      >
                        <span className="text-lg">{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Button */}
            {mounted && (
              <button 
                onClick={toggleTheme} 
                className="p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <Link 
              href="/login" 
              className={`bg-indigo-600 hover:bg-indigo-500 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-2 text-sm sm:text-base ${isRTL ? 'mr-1' : 'ml-1'}`}
            >
              {t.nav.signIn} <ChevronRight size={18} className={`hidden sm:block ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 dark:bg-indigo-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 dark:bg-blue-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-8 backdrop-blur-sm shadow-sm transition-colors duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            {t.hero.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight transition-colors duration-300">
            {t.hero.title1} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">{t.hero.titleHighlight}</span> {t.hero.title2}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed transition-colors duration-300">
            {t.hero.desc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] dark:shadow-[0_0_20px_rgba(79,70,229,0.5)]">
              {t.hero.btnPrimary}
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-full font-bold text-lg transition-all shadow-sm">
              {t.hero.btnSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* --- PLATFORM FEATURES --- */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">{t.features.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg transition-colors duration-300">{t.features.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">{t.features.card1Title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                {t.features.card1Desc}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                <Database size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">{t.features.card2Title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                {t.features.card2Desc}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6">
                <Bot size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">{t.features.card3Title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                {t.features.card3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- RBAC / ROLES SECTION --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">{t.rbac.title1} <br/><span className="text-indigo-600 dark:text-indigo-400">{t.rbac.titleHighlight}</span></h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 transition-colors duration-300">
                {t.rbac.desc}
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center"><ShieldCheck size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{t.rbac.role1Title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">{t.rbac.role1Desc}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center"><Users size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{t.rbac.role2Title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">{t.rbac.role2Desc}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center"><Lock size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{t.rbac.role3Title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">{t.rbac.role3Desc}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full relative">
              <div className="aspect-square w-full max-w-md mx-auto bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-full border-[8px] border-slate-50 dark:border-slate-950 shadow-2xl relative flex items-center justify-center transition-colors duration-300">
                 <Server size={100} className="text-indigo-500 opacity-30 dark:opacity-50" />
                 <div className={`absolute top-10 ${isRTL ? 'right-10' : 'left-10'} bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-bounce transition-colors duration-300`} style={{ animationDuration: '3s' }}><Bot className="text-emerald-500" /></div>
                 <div className={`absolute bottom-10 ${isRTL ? 'left-10' : 'right-10'} bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-bounce transition-colors duration-300`} style={{ animationDuration: '4s' }}><MessageSquare className="text-blue-500" /></div>
                 <div className={`absolute top-1/2 ${isRTL ? '-left-8' : '-right-8'} bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-bounce transition-colors duration-300`} style={{ animationDuration: '2.5s' }}><Database className="text-orange-500" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER & CONTACT --- */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 pt-20 pb-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-11 relative bg-indigo-600 rounded-lg p-1">
                  <Image src="/my_logo1.png" alt="Platform Logo" fill className="object-contain" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                  <span className="text-indigo-600 dark:text-indigo-400">{t.nav.platform}</span>
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md transition-colors duration-300">
                {t.footer.desc}
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">{t.footer.contactTitle}</h3>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:alharth.alhaj.hussein@gmail.com" className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" dir="ltr">
                    <Mail size={20} className="text-indigo-600 dark:text-indigo-500" /> alharth.alhaj.hussein@gmail.com 
                  </a>
                </li>
                <li>
                  <a href="tel:+963991292874" className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" dir="ltr">
                    <Phone size={20} className="text-indigo-600 dark:text-indigo-500" /> +963 (991) 292-874
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">{t.footer.socialTitle}</h3>
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/963991292874" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-[#25D366] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a href="https://t.me/aiagentsplatformbot" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-[#2AABEE] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                  <TelegramIcon className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-[#0077b5] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                  <LinkedInIcon className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm border border-slate-200 dark:border-transparent hover:border-transparent">
                  <XTwitterIcon className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-[#E4405F] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-[#FF0000] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                  <YouTubeIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
            <p className="text-sm text-slate-500 dark:text-slate-500">© {new Date().getFullYear()} {t.footer.rights}</p>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
              <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
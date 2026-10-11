import React, { useState } from 'react';
import AtmosphereSelector from './AtmosphereSelector';
import {
  Compass,
  Share2,
  Briefcase,
  MessageSquare,
  User,
  ShieldAlert,
  Bell,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Upload,
  Settings,
  LogOut,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenAdminModal,
  currentUser,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
  pendingInvitesCount = 0,
  isDark = false,
  onToggleTheme,
  isAuthenticated = true,
  onOpenAuth,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Clean Executive Identity */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0A66C2] to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg tracking-tight">W</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  Work<span className="text-[#0A66C2]">mark</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Network Verified" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block -mt-1">
                Verified Talent Network
              </p>
            </div>
          </button>

          {/* Global Search Bar */}
          <div className="relative hidden md:block w-56 lg:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search talent, jobs, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#0A66C2] text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:ring-1 focus:ring-[#0A66C2]"
            />
          </div>
        </div>

        {/* Primary Navigation Tabs (Matching LinkedIn Layout) */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {/* 1. Home / Feed */}
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'feed'
                ? 'text-[#0A66C2] bg-blue-50 dark:bg-blue-950/40 font-bold border-b-2 border-[#0A66C2]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="hidden sm:inline text-[11px]">Home</span>
          </button>

          {/* 2. My Network */}
          <button
            onClick={() => setActiveTab('network')}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'network'
                ? 'text-[#0A66C2] bg-blue-50 dark:bg-blue-950/40 font-bold border-b-2 border-[#0A66C2]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4 mb-0.5" />
            <span className="hidden sm:inline text-[11px]">Network</span>
            {pendingInvitesCount > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-[#0A66C2] text-white">
                {pendingInvitesCount}
              </span>
            )}
          </button>

          {/* 3. Jobs */}
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'jobs'
                ? 'text-[#0A66C2] bg-blue-50 dark:bg-blue-950/40 font-bold border-b-2 border-[#0A66C2]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span className="hidden sm:inline text-[11px]">Jobs</span>
          </button>

          {/* 4. Messaging */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'messages'
                ? 'text-[#0A66C2] bg-blue-50 dark:bg-blue-950/40 font-bold border-b-2 border-[#0A66C2]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span className="hidden sm:inline text-[11px]">Messaging</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* 5. Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'notifications'
                ? 'text-[#0A66C2] bg-blue-50 dark:bg-blue-950/40 font-bold border-b-2 border-[#0A66C2]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4 mb-0.5" />
            <span className="hidden sm:inline text-[11px]">Alerts</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* 6. Admin Panel */}
          <button
            onClick={() => {
              if (isAdmin) {
                setActiveTab('admin');
              } else {
                onOpenAdminModal();
              }
            }}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'admin'
                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-bold border-b-2 border-rose-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 mb-0.5" />
            <span className="hidden sm:inline text-[11px]">Admin</span>
          </button>
        </nav>

        {/* Right Section: Theme Toggle + 3D Atmosphere + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0A66C2] transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* 3D Light Atmosphere Selector */}
          <AtmosphereSelector />

          {/* Authentication State: Logged In vs Logged Out */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth && onOpenAuth('signin')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0A66C2] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                className="px-4 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
              >
                Join Now
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0A66C2] transition-all group"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-xl object-cover border border-slate-300 dark:border-slate-600"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-[#0A66C2] transition-colors">
                    Me
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl z-50 animate-fade-in">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
                    </div>
                  </div>

                  <div className="py-2 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#0A66C2] flex items-center gap-2 transition-colors font-medium"
                    >
                      <User className="w-4 h-4 text-[#0A66C2]" />
                      <span>View Profile & Work</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-indigo-600 flex items-center gap-2 transition-colors font-medium"
                    >
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>Upload & Distribute Work</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isAdmin) {
                          setActiveTab('admin');
                        } else {
                          onOpenAdminModal();
                        }
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800 hover:text-rose-600 flex items-center gap-2 transition-colors font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Admin Control Tower</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onOpenAuth) onOpenAuth('signin');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-[#0A66C2] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

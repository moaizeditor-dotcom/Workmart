import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import FloatingChatDock from './components/FloatingChatDock';
import FeedView from './views/FeedView';
import NetworkView from './views/NetworkView';
import JobsView from './views/JobsView';
import ProfileView from './views/ProfileView';
import MessagingView from './views/MessagingView';
import NotificationsView from './views/NotificationsView';
import AdminPanelView from './views/AdminPanelView';
import AdminLoginModal from './components/AdminLoginModal';
import AuthModal from './components/AuthModal';
import LandingView from './views/LandingView';

import {
  getAuthToken,
  setAuthToken,
  getMe,
  getPosts,
  createPost as apiCreatePost,
  reactPost as apiReactPost,
  votePoll as apiVotePoll,
  addComment as apiAddComment,
  getJobs,
  createJob as apiCreateJob,
  applyJob as apiApplyJob,
  getMyApplications,
  getNetwork,
  connectUser as apiConnectUser,
  getMessages,
  sendMessage as apiSendMessage,
  getNotifications,
  markNotificationsRead,
  updateProfile as apiUpdateProfile,
  addArtifact as apiAddArtifact,
  deleteArtifact as apiDeleteArtifact,
  addSkill as apiAddSkill,
  endorseSkill as apiEndorseSkill,
  logoutUser
} from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem('workmark_current_user');
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Core Data
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [networkNodes, setNetworkNodes] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Modals & Admin
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Theme State
  const [isDark, setIsDark] = useState(() => localStorage.getItem('workmark_theme') === 'dark');

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('workmark_theme', next ? 'dark' : 'light');
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Dynamic SEO Meta Tags & View State Sync
  useEffect(() => {
    const seoData = {
      feed: {
        title: 'WorkMart — Verified Tech Talent Network & Home Feed',
        desc: 'Explore technical insights, architectural case studies, and engineering updates from verified software engineers on WorkMart.',
        url: 'https://workmart.netlify.app/#feed'
      },
      network: {
        title: '3D Spatial Talent Constellation & Network | WorkMart',
        desc: 'Explore the interactive 3D spatial talent graph connecting accredited developers, cloud architects, and research scientists.',
        url: 'https://workmart.netlify.app/#network'
      },
      jobs: {
        title: 'Tech Careers, High-Impact Roles & Opportunities | WorkMart',
        desc: 'Discover verified software architecture, distributed systems, and AI engineering opportunities with transparent compensation on WorkMart.',
        url: 'https://workmart.netlify.app/#jobs'
      },
      profile: {
        title: `${currentUser?.name ? currentUser.name + ' — Verified Dossier' : 'Verified Proof of Work Dossier'} | WorkMart`,
        desc: 'View verified proof-of-work engineering dossiers, distributed system contributions, and cryptographic credentials on WorkMart.',
        url: 'https://workmart.netlify.app/#profile'
      },
      messages: {
        title: 'Direct Verified Messaging | WorkMart',
        desc: 'Connect and message directly with verified software engineers and engineering hiring managers on WorkMart.',
        url: 'https://workmart.netlify.app/#messages'
      },
      notifications: {
        title: 'Verified Career Alerts & Notifications | WorkMart',
        desc: 'Stay updated on job application statuses, verified peer endorsements, and engineering discussions.',
        url: 'https://workmart.netlify.app/#notifications'
      },
      admin: {
        title: 'Admin Control Tower | WorkMart',
        desc: 'WorkMart administrative control tower and talent verification telemetry.',
        url: 'https://workmart.netlify.app/#admin'
      }
    };

    const currentSeo = seoData[activeTab] || {
      title: 'WorkMart — The Verified Tech Talent Network & Career Marketplace',
      desc: 'Connect with elite verified software engineers, architects, and technical leaders. Discover high-impact tech opportunities, showcase proof-of-work, and hire verified talent.',
      url: 'https://workmart.netlify.app/'
    };

    document.title = currentSeo.title;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', currentSeo.desc);
    setMeta('property', 'og:title', currentSeo.title);
    setMeta('property', 'og:description', currentSeo.desc);
    setMeta('property', 'og:url', currentSeo.url);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', currentSeo.url);
    }
  }, [activeTab, currentUser]);

  // Persist current user to localStorage whenever updated
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('workmark_current_user', JSON.stringify(currentUser));
      } catch (_) {}
    }
  }, [currentUser]);

  // Load Real Data from Backend
  const refreshAppData = async () => {
    try {
      // 1. Fetch Posts
      const postsRes = await getPosts().catch(() => ({ posts: [] }));
      setPosts(postsRes.posts || []);

      // 2. Fetch Jobs
      const jobsRes = await getJobs().catch(() => ({ jobs: [] }));
      setJobs(jobsRes.jobs || []);

      // 3. Authenticated Data
      if (getAuthToken()) {
        const meRes = await getMe().catch(() => null);
        if (meRes && meRes.user) {
          setCurrentUser(meRes.user);
          setIsAuthenticated(true);
          setIsAdmin(meRes.user.is_admin === 1);

          // Applications
          const appRes = await getMyApplications().catch(() => ({ applications: [] }));
          setApplications(appRes.applications || []);

          // Network
          const netRes = await getNetwork().catch(() => ({ nodes: [] }));
          setNetworkNodes(netRes.nodes || []);

          // Notifications
          const notifRes = await getNotifications().catch(() => ({ notifications: [] }));
          setNotifications(notifRes.notifications || []);
        } else {
          setAuthToken(null);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to load real data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthUrlState = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.delete('token');
    url.searchParams.delete('auth_error');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
  };

  // Process incoming OAuth callbacks from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const tokenParam = hashParams.get('token') || params.get('token');
    const authErrorParam = params.get('auth_error');

    if (tokenParam) {
      setAuthToken(tokenParam);
      setIsAuthenticated(true);
      clearAuthUrlState();
      refreshAppData();
    } else if (authErrorParam) {
      clearAuthUrlState();
      alert(`OAuth Notice: ${authErrorParam}`);
      refreshAppData();
    } else {
      refreshAppData();
    }
  }, []);

  // Authentication Handlers
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAdmin(user.is_admin === 1);
    setIsAuthModalOpen(false);
    await refreshAppData();
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('workmark_current_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveTab('feed');
  };

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // User Profile Actions
  const handleUpdateUser = async (updatedData) => {
    try {
      const res = await apiUpdateProfile(updatedData);
      if (res.user) {
        setCurrentUser((prev) => ({ ...prev, ...res.user }));
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const handleAddArtifact = async (artData) => {
    try {
      await apiAddArtifact(artData);
      const me = await getMe();
      if (me.user) setCurrentUser(me.user);
    } catch (err) {
      console.error('Add artifact error:', err);
    }
  };

  const handleDeleteArtifact = async (artId) => {
    try {
      await apiDeleteArtifact(artId);
      const me = await getMe();
      if (me.user) setCurrentUser(me.user);
    } catch (err) {
      console.error('Delete artifact error:', err);
    }
  };

  const handleAddSkill = async (name, score) => {
    try {
      await apiAddSkill(name, score);
      const me = await getMe();
      if (me.user) setCurrentUser(me.user);
    } catch (err) {
      console.error('Add skill error:', err);
    }
  };

  const handleEndorseSkill = async (skillId) => {
    try {
      await apiEndorseSkill(skillId);
      const me = await getMe();
      if (me.user) setCurrentUser(me.user);
    } catch (err) {
      console.error('Endorse skill error:', err);
    }
  };

  // Post Actions
  const handleNewPost = async (postData) => {
    if (!isAuthenticated) return handleOpenAuth('signup');
    try {
      await apiCreatePost(postData);
      const res = await getPosts();
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Create post error:', err);
    }
  };

  const handlePostsChange = (newPosts) => {
    setPosts(newPosts);
  };

  // Job Actions
  const handleNewJob = async (jobData) => {
    if (!isAuthenticated) return handleOpenAuth('signup');
    try {
      await apiCreateJob(jobData);
      const res = await getJobs();
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Create job error:', err);
    }
  };

  const handleApplyJob = async (job, form) => {
    if (!isAuthenticated) return handleOpenAuth('signup');
    try {
      await apiApplyJob(job.id, form);
      const res = await getMyApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Apply job error:', err);
    }
  };

  // Network Actions
  const handleConnect = async (peerId, note) => {
    if (!isAuthenticated) return handleOpenAuth('signup');
    try {
      await apiConnectUser(peerId, note);
      const res = await getNetwork();
      setNetworkNodes(res.nodes || []);
    } catch (err) {
      console.error('Connect error:', err);
    }
  };

  // Message Actions
  const handleSendMessage = async (convId, text) => {
    if (!isAuthenticated) return handleOpenAuth('signup');
    try {
      await apiSendMessage(convId, text);
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // Notification Actions
  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Admin Actions
  const handleAdminLoginSuccess = async (adminUser) => {
    if (adminUser) {
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
    }
    setIsAdmin(true);
    setActiveTab('admin');
    await refreshAppData();
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setActiveTab('feed');
  };

  // If not logged in and visitor opens site, show real Landing & Auth screen
  if (!isAuthenticated && !currentUser) {
    return (
      <>
        <LandingView
          onLoginSuccess={handleLoginSuccess}
          onExploreGuest={() => setIsAuthenticated(true)}
          onOpenAuth={handleOpenAuth}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authModalMode}
        />
      </>
    );
  }

  // Authenticated Dashboard
  const safeUser = currentUser || {
    name: 'Verified User',
    handle: '@verified_user',
    role: 'Software Architect',
    company: 'Enterprise',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    workmarkScore: 950,
    skills: [],
    artifacts: [],
    experience: []
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {/* Ambient WebGL Ribbon */}
      <ThreeBackground isDark={isDark} />

      {/* Persistent Global Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        currentUser={safeUser}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={0}
        pendingInvitesCount={0}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Views Container */}
      <main className="flex-1 pb-24 md:pb-16 overflow-x-hidden w-full max-w-full">
        {/* 1. Feed / Home */}
        {activeTab === 'feed' && (
          <FeedView
            posts={posts}
            onNewPost={handleNewPost}
            onPostsChange={handlePostsChange}
            onToggleSavePost={(id) => setSavedPostIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])}
            savedPostIds={savedPostIds}
            currentUser={safeUser}
          />
        )}

        {/* 2. My Network */}
        {activeTab === 'network' && (
          <NetworkView
            nodes={networkNodes}
            onConnect={handleConnect}
            onAcceptInvite={() => {}}
            onIgnoreInvite={() => {}}
            currentUser={safeUser}
          />
        )}

        {/* 3. Jobs / Opportunities */}
        {activeTab === 'jobs' && (
          <JobsView
            jobs={jobs}
            onNewJob={handleNewJob}
            applications={applications}
            onApplyJob={handleApplyJob}
            onToggleSaveJob={(id) => setSavedJobIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])}
            savedJobIds={savedJobIds}
            currentUser={safeUser}
          />
        )}

        {/* 4. Messaging */}
        {activeTab === 'messages' && (
          <MessagingView
            conversations={conversations}
            onSendMessage={handleSendMessage}
            onNewConversation={() => {}}
            currentUser={safeUser}
            connections={networkNodes.filter((n) => n.status === 'connected')}
          />
        )}

        {/* 5. Notifications */}
        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onDeleteNotification={() => {}}
            onNotificationClick={() => {}}
          />
        )}

        {/* 6. Profile / Dossier */}
        {activeTab === 'profile' && (
          <ProfileView
            user={safeUser}
            onUpdateUser={handleUpdateUser}
            onAddArtifact={handleAddArtifact}
            onDeleteArtifact={handleDeleteArtifact}
            onAddSkill={handleAddSkill}
            onEndorseSkill={handleEndorseSkill}
          />
        )}

        {/* 7. Admin Control Tower */}
        {activeTab === 'admin' && (
          <AdminPanelView
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Floating LinkedIn-Style Mini Chat Dock */}
      {isAuthenticated && (
        <FloatingChatDock
          conversations={conversations}
          onSendMessage={handleSendMessage}
          currentUser={safeUser}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Professional Enterprise Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur text-xs text-slate-500 font-sans transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Workmark</span>
            </div>
            <span>© 2026 Workmark Corporation. Verified Professional Network.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="hover:text-[#0A66C2] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">User Agreement</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">Cookie Policy</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">Community Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

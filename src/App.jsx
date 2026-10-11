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
  loadInitialAppData,
  setStoredItem,
  STORAGE_KEYS,
  resetAllData
} from './utils/storage';

export default function App() {
  // Load initial persistent state from localStorage
  const initialData = loadInitialAppData();

  const [activeTab, setActiveTab] = useState('feed');
  const [currentUser, setCurrentUser] = useState(initialData.user);
  const [posts, setPosts] = useState(initialData.posts);
  const [networkNodes, setNetworkNodes] = useState(initialData.nodes);
  const [jobs, setJobs] = useState(initialData.jobs);
  const [applications, setApplications] = useState(initialData.applications);
  const [conversations, setConversations] = useState(initialData.messages);
  const [notifications, setNotifications] = useState(initialData.notifications);
  const [savedPostIds, setSavedPostIds] = useState(initialData.savedPosts);
  const [savedJobIds, setSavedJobIds] = useState(initialData.savedJobs);

  // Authentication State (Google, GitHub, X, Email)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('workmark_auth_token') !== null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Theme State: Default is Light Theme
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('workmark_theme') === 'dark';
  });

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('workmark_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync state changes to localStorage
  useEffect(() => {
    setStoredItem(STORAGE_KEYS.USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.POSTS, posts);
  }, [posts]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.NETWORK, networkNodes);
  }, [networkNodes]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.JOBS, jobs);
  }, [jobs]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.APPLICATIONS, applications);
  }, [applications]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.MESSAGES, conversations);
  }, [conversations]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.SAVED_POSTS, savedPostIds);
  }, [savedPostIds]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.SAVED_JOBS, savedJobIds);
  }, [savedJobIds]);

  // Handlers for Authentication (Google, GitHub, X, Email)
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('workmark_auth_token', 'wm_' + Date.now());
    setStoredItem(STORAGE_KEYS.USER, user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('workmark_auth_token');
  };

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handlers for User Profile Updates
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Handlers for Posts
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostsChange = (updatedPosts) => {
    setPosts(updatedPosts);
  };

  const handleToggleSavePost = (postId) => {
    if (savedPostIds.includes(postId)) {
      setSavedPostIds(savedPostIds.filter((id) => id !== postId));
    } else {
      setSavedPostIds([...savedPostIds, postId]);
    }
  };

  // Handlers for Jobs
  const handleNewJob = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  const handleApplyJob = (job, form) => {
    const newApp = {
      jobId: job.id,
      job: job,
      form: form,
      date: 'Just now',
      status: 'Under Review'
    };
    setApplications([newApp, ...applications]);

    // Send automated notification
    const jobNotif = {
      id: `notif_${Date.now()}`,
      type: 'job',
      actor: {
        name: job.company,
        avatar: job.logo,
        role: 'Verified Employer'
      },
      title: `Application confirmed for ${job.title}`,
      detail: 'Your Workmark cryptographic dossier was delivered to hiring leads.',
      timestamp: 'Just now',
      read: false,
      linkTab: 'jobs'
    };
    setNotifications([jobNotif, ...notifications]);
  };

  const handleToggleSaveJob = (jobId) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  // Handlers for Network & Connections
  const handleConnect = (peerId, note) => {
    setNetworkNodes(
      networkNodes.map((node) => {
        if (node.id === peerId) {
          return { ...node, status: 'connected' };
        }
        return node;
      })
    );
    setCurrentUser({
      ...currentUser,
      connectionsCount: (currentUser.connectionsCount || 1420) + 1
    });
  };

  const handleAcceptInvite = (invite) => {
    // Add to network nodes as connected
    const newNode = {
      id: invite.id,
      name: invite.name,
      role: invite.role,
      company: 'BrainLink Labs',
      score: invite.score,
      connections: 2400,
      mutual: invite.mutual,
      avatar: invite.avatar,
      category: 'AI & Research',
      status: 'connected'
    };
    setNetworkNodes([newNode, ...networkNodes]);
    setCurrentUser({
      ...currentUser,
      connectionsCount: (currentUser.connectionsCount || 1420) + 1
    });

    // Notify
    const connNotif = {
      id: `notif_${Date.now()}`,
      type: 'connection',
      actor: {
        name: invite.name,
        avatar: invite.avatar,
        role: invite.role
      },
      title: 'is now in your constellation',
      detail: 'You and ' + invite.name + ' are now 1st-degree verified connections.',
      timestamp: 'Just now',
      read: false,
      linkTab: 'network'
    };
    setNotifications([connNotif, ...notifications]);
  };

  const handleIgnoreInvite = (inviteId) => {
    // Handled in NetworkView local state
  };

  // Handlers for Messaging
  const handleSendMessage = (convId, text, sender = 'me') => {
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: sender,
      text: text,
      time: 'Just now'
    };

    setConversations(
      conversations.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessage: text,
            timestamp: 'Just now',
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );
  };

  const handleNewConversation = (newConv) => {
    setConversations([newConv, ...conversations]);
  };

  // Handlers for Notifications
  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications(notifications.filter((n) => n.id !== notifId));
  };

  const handleNotificationClick = (notif) => {
    // Mark as read
    setNotifications(
      notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setActiveTab('feed');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  // If not logged in, render the LinkedIn-style Landing Gateway
  if (!isAuthenticated) {
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

  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {/* 3D Animated Background Mesh */}
      <ThreeBackground isDark={isDark} />

      {/* Persistent Global Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
        pendingInvitesCount={2}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Views Container */}
      <main className="flex-1 pb-16">
        {/* 1. Feed / Home */}
        {activeTab === 'feed' && (
          <FeedView
            posts={posts}
            onNewPost={handleNewPost}
            onPostsChange={handlePostsChange}
            onToggleSavePost={handleToggleSavePost}
            savedPostIds={savedPostIds}
            currentUser={currentUser}
          />
        )}

        {/* 2. My Network */}
        {activeTab === 'network' && (
          <NetworkView
            nodes={networkNodes}
            onConnect={handleConnect}
            onAcceptInvite={handleAcceptInvite}
            onIgnoreInvite={handleIgnoreInvite}
            currentUser={currentUser}
          />
        )}

        {/* 3. Jobs / Opportunities */}
        {activeTab === 'jobs' && (
          <JobsView
            jobs={jobs}
            onNewJob={handleNewJob}
            applications={applications}
            onApplyJob={handleApplyJob}
            onToggleSaveJob={handleToggleSaveJob}
            savedJobIds={savedJobIds}
            currentUser={currentUser}
          />
        )}

        {/* 4. Messaging */}
        {activeTab === 'messages' && (
          <MessagingView
            conversations={conversations}
            onSendMessage={handleSendMessage}
            onNewConversation={handleNewConversation}
            currentUser={currentUser}
            connections={networkNodes.filter((n) => n.status === 'connected')}
          />
        )}

        {/* 5. Notifications */}
        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onDeleteNotification={handleDeleteNotification}
            onNotificationClick={handleNotificationClick}
          />
        )}

        {/* 6. Profile / Dossier */}
        {activeTab === 'profile' && (
          <ProfileView
            user={currentUser}
            onUpdateUser={handleUpdateUser}
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
      <FloatingChatDock
        conversations={conversations}
        onSendMessage={handleSendMessage}
        currentUser={currentUser}
      />

      {/* Auth Modal (Google, GitHub, Twitter/X, Email) */}
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

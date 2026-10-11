// Centralized storage manager for Workmark (LinkedIn 3D Upgraded)
// Ensures full state persistence across page reloads and deployments

import {
  currentUser as initialUser,
  initialPosts as defaultPosts,
  networkNodes as defaultNodes,
  initialJobs as defaultJobs,
  initialMessages as defaultMessages,
  initialAdminStats as defaultAdminStats
} from '../data/mockData';

const STORAGE_KEYS = {
  USER: 'workmark_current_user',
  POSTS: 'workmark_posts',
  NETWORK: 'workmark_network_nodes',
  JOBS: 'workmark_jobs',
  APPLICATIONS: 'workmark_job_applications',
  MESSAGES: 'workmark_messages',
  ADMIN_STATS: 'workmark_admin_stats',
  NOTIFICATIONS: 'workmark_notifications',
  SAVED_POSTS: 'workmark_saved_posts',
  SAVED_JOBS: 'workmark_saved_jobs'
};

export const getStoredItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
};

// Default Notifications
export const defaultNotifications = [
  {
    id: 'notif_1',
    type: 'reaction',
    actor: {
      name: 'Dr. Sarah Lin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      role: 'Head of Neuro-AI at BrainLink Labs'
    },
    title: 'reacted to your technical proof',
    detail: 'vouched for your Distributed Consensus Architecture RFC.',
    timestamp: '15m ago',
    read: false,
    linkTab: 'feed'
  },
  {
    id: 'notif_2',
    type: 'connection',
    actor: {
      name: 'Julian Drake',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      role: 'Chief Product Officer at Apex Spatial'
    },
    title: 'sent you a connection request',
    detail: '"Alex, let\'s collaborate on next-gen spatial 3D engine interfaces!"',
    timestamp: '1h ago',
    read: false,
    linkTab: 'network'
  },
  {
    id: 'notif_3',
    type: 'view',
    actor: {
      name: 'Recruiter at Hyperion Spatial',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      role: 'Executive Talent Lead'
    },
    title: 'viewed your Workmark Dossier',
    detail: 'Your profile appeared in 42 executive candidate searches this week.',
    timestamp: '3h ago',
    read: true,
    linkTab: 'profile'
  },
  {
    id: 'notif_4',
    type: 'job',
    actor: {
      name: 'Nova Dynamics',
      avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80',
      role: 'AI Systems Department'
    },
    title: 'New 98% Match Opportunity',
    detail: 'Principal 3D Graphics & Spatial Engine Architect ($240k - $340k).',
    timestamp: '1d ago',
    read: true,
    linkTab: 'jobs'
  }
];

export const loadInitialAppData = () => {
  return {
    user: getStoredItem(STORAGE_KEYS.USER, initialUser),
    posts: getStoredItem(STORAGE_KEYS.POSTS, defaultPosts),
    nodes: getStoredItem(STORAGE_KEYS.NETWORK, defaultNodes),
    jobs: getStoredItem(STORAGE_KEYS.JOBS, defaultJobs),
    applications: getStoredItem(STORAGE_KEYS.APPLICATIONS, []),
    messages: getStoredItem(STORAGE_KEYS.MESSAGES, defaultMessages),
    adminStats: getStoredItem(STORAGE_KEYS.ADMIN_STATS, defaultAdminStats),
    notifications: getStoredItem(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications),
    savedPosts: getStoredItem(STORAGE_KEYS.SAVED_POSTS, []),
    savedJobs: getStoredItem(STORAGE_KEYS.SAVED_JOBS, [])
  };
};

export const resetAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  } catch (err) {
    console.error('Error resetting data:', err);
  }
};

export { STORAGE_KEYS };

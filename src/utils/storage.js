// Storage helper for offline caching & session persistence

const STORAGE_KEYS = {
  USER: 'workmark_current_user',
  TOKEN: 'workmark_token',
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
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export const defaultNotifications = [];

export const loadInitialAppData = () => {
  return {
    user: getStoredItem(STORAGE_KEYS.USER, null),
    posts: getStoredItem(STORAGE_KEYS.POSTS, []),
    nodes: getStoredItem(STORAGE_KEYS.NETWORK, []),
    jobs: getStoredItem(STORAGE_KEYS.JOBS, []),
    applications: getStoredItem(STORAGE_KEYS.APPLICATIONS, []),
    messages: getStoredItem(STORAGE_KEYS.MESSAGES, []),
    adminStats: getStoredItem(STORAGE_KEYS.ADMIN_STATS, {
      registeredUsers: 0,
      activePosts: 0,
      jobsPosted: 0,
      applicationsSubmitted: 0
    }),
    notifications: getStoredItem(STORAGE_KEYS.NOTIFICATIONS, []),
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

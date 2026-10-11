// Centralized Production API Client for Workmark
const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('workmark_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('workmark_token', token);
  } else {
    localStorage.removeItem('workmark_token');
    localStorage.removeItem('workmark_current_user');
  }
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

// Auth
export const registerUser = (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const socialLogin = (socialData) => request('/auth/social', { method: 'POST', body: JSON.stringify(socialData) });
export const getOAuthConfig = () => request('/auth/oauth/config');
export const getMe = () => request('/auth/me');
export const logoutUser = () => {
  setAuthToken(null);
  return Promise.resolve();
};

// Users & Profile
export const getUserProfile = (id) => request(`/users/${id}`);
export const updateProfile = (profileData) => request('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) });
export const addSkill = (name, score) => request('/users/skills', { method: 'POST', body: JSON.stringify({ name, score }) });
export const endorseSkill = (skillId) => request(`/users/skills/${skillId}/endorse`, { method: 'POST' });
export const addArtifact = (artifactData) => request('/users/artifacts', { method: 'POST', body: JSON.stringify(artifactData) });
export const deleteArtifact = (id) => request(`/users/artifacts/${id}`, { method: 'DELETE' });

// Posts
export const getPosts = () => request('/posts');
export const createPost = (postData) => request('/posts', { method: 'POST', body: JSON.stringify(postData) });
export const reactPost = (postId, reactionType) => request(`/posts/${postId}/react`, { method: 'POST', body: JSON.stringify({ reactionType }) });
export const votePoll = (postId, optionIndex) => request(`/posts/${postId}/poll/vote`, { method: 'POST', body: JSON.stringify({ optionIndex }) });
export const addComment = (postId, text) => request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });

// Jobs
export const getJobs = () => request('/jobs');
export const createJob = (jobData) => request('/jobs', { method: 'POST', body: JSON.stringify(jobData) });
export const applyJob = (jobId, applicationData) => request(`/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(applicationData) });
export const getMyApplications = () => request('/jobs/applications');

// Network
export const getNetwork = () => request('/network');
export const connectUser = (targetUserId, note) => request('/network/connect', { method: 'POST', body: JSON.stringify({ targetUserId, note }) });

// Messages
export const getMessages = () => request('/messages');
export const sendMessage = (recipientId, text) => request('/messages', { method: 'POST', body: JSON.stringify({ recipientId, text }) });

// Notifications
export const getNotifications = () => request('/notifications');
export const markNotificationsRead = () => request('/notifications/read-all', { method: 'PUT' });

// Admin
export const getAdminStats = () => request('/admin/stats');
export const getAdminUsers = () => request('/admin/users');

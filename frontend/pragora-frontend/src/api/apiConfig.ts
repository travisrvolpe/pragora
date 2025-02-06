const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_GET_USER: `${API_BASE_URL}/auth/user`,

  // User Profile
  PROFILE_ME: `${API_BASE_URL}/profiles/me`,
  PROFILE_GET: `${API_BASE_URL}/profiles/me`,
  PROFILE_BY_ID: (userId: number) => `${API_BASE_URL}/profiles/${userId}`,
  PROFILE_CREATE: `${API_BASE_URL}/profiles/`,
  PROFILE_UPDATE: `${API_BASE_URL}/profiles/me`,
  PROFILE_DELETE: `${API_BASE_URL}/profiles/me`,
  PROFILE_SAVE_POST: (postId: number) => `${API_BASE_URL}/profiles/me/save-post/${postId}`,
  PROFILE_SAVED_POSTS: `${API_BASE_URL}/profiles/me/saved-posts`,
  PROFILE_AVATAR_UPLOAD: `${API_BASE_URL}/profiles/me/avatar`,
  PROFILE_AVATAR_UPDATE: `${API_BASE_URL}/profiles/me/avatar`,

  // Posts
  POSTS: `${API_BASE_URL}/posts`,
  POST_BY_ID: (postId: number) => `${API_BASE_URL}/posts/${postId}`,
  POST_CREATE: `${API_BASE_URL}/posts`,
  POST_DELETE: (postId: number) => `${API_BASE_URL}/posts/${postId}`,
  POST_MY_POSTS: `${API_BASE_URL}/posts/me`,
  POST_TRENDING: (timeframe: string) => `${API_BASE_URL}/posts/trending/${timeframe}`,
  POST_RECOMMENDED: `${API_BASE_URL}/posts/recommended`,
  POST_UPLOAD_IMAGE: (postId: number) => `${API_BASE_URL}/posts/${postId}/upload-image`,
  POST_GET_IMAGE: (postId: number) => `${API_BASE_URL}/posts/${postId}/image`,
  POST_READ: (postId: number) => `${API_BASE_URL}/posts/${postId}/read`,

  // Post Engagement
  POST_LIKE: (postId: number) => `${API_BASE_URL}/posts/engagement/${postId}/like`,
  POST_DISLIKE: (postId: number) => `${API_BASE_URL}/posts/engagement/${postId}/dislike`,
  POST_SAVE: (postId: number) => `${API_BASE_URL}/posts/engagement/${postId}/save`,
  POST_SHARE: (postId: number) => `${API_BASE_URL}/posts/engagement/${postId}/share`,
  POST_REPORT: (postId: number) => `${API_BASE_URL}/posts/engagement/${postId}/report`,
  POST_UPDATE_METRICS: (postId: number) => `${API_BASE_URL}/posts/engagement/${postId}/metrics`,

  // Comments
  COMMENT_CREATE: (postId: number) => `${API_BASE_URL}/posts/${postId}/comments`,
  COMMENT_INTERACT: `${API_BASE_URL}/posts/comments/interactions`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  SUBCATEGORIES: (categoryId: number) => `${API_BASE_URL}/categories/${categoryId}/subcategories`,
};

export default API_ENDPOINTS;

// src/lib/api/endpoints.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/graphql';

// Helper function to prepend API_BASE_URL to endpoints
const createEndpoint = (path: string) => `${API_BASE_URL}${path}`;



export const API_ENDPOINTS = {
  // GraphQL endpoints
  GRAPHQL: GRAPHQL_URL,
  GRAPHQL_WS: WS_URL,

  // REST Authentication endpoints
  AUTH_LOGIN: createEndpoint('/auth/login'),
  AUTH_REGISTER: createEndpoint('/auth/register'),
  AUTH_GET_USER: createEndpoint('/auth/user'),
  AUTH_SESSION_CLEANUP: createEndpoint('/auth/session/cleanup'),

  // User Profile
  PROFILE_ME: createEndpoint('/profiles/me'),
  PROFILE_GET: createEndpoint('/profiles/me'),
  PROFILE_BY_ID: (userId: number) => createEndpoint(`/profiles/${userId}`),
  PROFILE_CREATE: createEndpoint('/profiles'),
  PROFILE_UPDATE: createEndpoint('/profiles/me'),
  PROFILE_DELETE: createEndpoint('/profiles/me'),
  PROFILE_SAVE_POST: (postId: number) => createEndpoint(`/profiles/me/save-post/${postId}`),
  PROFILE_SAVED_POSTS: createEndpoint('/profiles/me/saved-posts'),
  PROFILE_AVATAR_UPLOAD: createEndpoint('/profiles/me/avatar'),
  PROFILE_AVATAR_UPDATE: createEndpoint('/profiles/me/avatar'),
  MEDIA_URL: (path: string) => `${API_BASE_URL}/media${path}`,

  // Posts
  POSTS: createEndpoint('/posts'),
  POST_BY_ID: (postId: number) => createEndpoint(`/posts/${postId}`),
  POST_CREATE: createEndpoint('/posts'),
  POST_DELETE: (postId: number) => createEndpoint(`/posts/${postId}`),
  POST_MY_POSTS: createEndpoint('/posts/me'),
  POST_TRENDING: (timeframe: string) => createEndpoint(`/posts/trending/${timeframe}`),
  POST_RECOMMENDED: createEndpoint('/posts/recommended'),
  POST_UPLOAD_IMAGE: (postId: number) => createEndpoint(`/posts/${postId}/upload-image`),
  POST_GET_IMAGE: (postId: number) => createEndpoint(`/posts/${postId}/image`),
  POST_READ: (postId: number) => createEndpoint(`/posts/${postId}/read`),

  // Post Engagement
  POST_LIKE: (postId: number) => createEndpoint(`/posts/engagement/${postId}/like`),
  POST_DISLIKE: (postId: number) => createEndpoint(`/posts/engagement/${postId}/dislike`),
  POST_SAVE: (postId: number) => createEndpoint(`/posts/engagement/${postId}/save`),
  POST_SHARE: (postId: number) => createEndpoint(`/posts/engagement/${postId}/share`),
  POST_REPORT: (postId: number) => createEndpoint(`/posts/engagement/${postId}/report`),
  POST_UPDATE_METRICS: (postId: number) => createEndpoint(`/posts/engagement/${postId}/metrics`),


  // Categories
  CATEGORIES: createEndpoint('/categories'),
  SUBCATEGORIES: (categoryId: number) => createEndpoint(`/categories/${categoryId}/subcategories`),
} as const;

export type EndpointKey = keyof typeof API_ENDPOINTS;
export default API_ENDPOINTS;
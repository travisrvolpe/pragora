// postService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const postService = {
  getPost: async () => {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data;
  },

  getPostById: async (post_id) => {
    const response = await axios.get(`${API_URL}/posts/${post_id}`);
    return response.data;
  },

  createPost: async (data) => {
    const response = await axios.post(`${API_URL}/posts`, data);
    return response.data;
  },

  updatePost: async (post_id, data) => {
    const response = await axios.put(`${API_URL}/posts/${post_id}`, data);
    return response.data;
  },

  deletePost: async (post_id) => {
    const response = await axios.delete(`${API_URL}/posts/${post_id}`);
    return response.data;
  }
};

export default postService;
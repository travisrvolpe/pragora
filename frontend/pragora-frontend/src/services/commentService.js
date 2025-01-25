// commentService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const commentService = {
  getComments: async (post_id) => {
    const response = await axios.get(`${API_URL}/post/${post_id}/comments`);
    return response.data;
  },

  addComment: async (post_id, data) => {
    const response = await axios.post(`${API_URL}/post/${post_id}/comments`, data);
    return response.data;
  },

  updateComment: async (id, data) => {
    const response = await axios.put(`${API_URL}/comments/${id}`, data);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await axios.delete(`${API_URL}/comments/${id}`);
    return response.data;
  }
};

export default commentService;

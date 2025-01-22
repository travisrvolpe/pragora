// commentService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const commentService = {
  getComments: async (discussionId) => {
    const response = await axios.get(`${API_URL}/discussions/${discussionId}/comments`);
    return response.data;
  },

  addComment: async (discussionId, data) => {
    const response = await axios.post(`${API_URL}/discussions/${discussionId}/comments`, data);
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

// discussionService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const discussionService = {
  getDiscussions: async () => {
    const response = await axios.get(`${API_URL}/discussions`);
    return response.data;
  },

  getDiscussionById: async (id) => {
    const response = await axios.get(`${API_URL}/discussions/${id}`);
    return response.data;
  },

  createDiscussion: async (data) => {
    const response = await axios.post(`${API_URL}/discussions`, data);
    return response.data;
  },

  updateDiscussion: async (id, data) => {
    const response = await axios.put(`${API_URL}/discussions/${id}`, data);
    return response.data;
  },

  deleteDiscussion: async (id) => {
    const response = await axios.delete(`${API_URL}/discussions/${id}`);
    return response.data;
  }
};

export default discussionService;
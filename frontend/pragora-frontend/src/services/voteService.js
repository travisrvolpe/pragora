// voteService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const voteService = {
  voteOnPost: async (postId, voteType) => {
    const response = await axios.post(`${API_URL}/posts/${postId}/vote`, { voteType });
    return response.data;
  },

  voteOnComment: async (commentId, voteType) => {
    const response = await axios.post(`${API_URL}/comments/${commentId}/vote`, { voteType });
    return response.data;
  }
};

export default voteService;

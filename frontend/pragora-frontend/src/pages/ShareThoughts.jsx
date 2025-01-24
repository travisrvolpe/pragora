//import "../styles/pages/CreateContent.css";
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';

const ShareThoughts = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const maxLength = 280;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token'); //
      const response = await axios.post('http://localhost:8000/posts/', {
        title,
        content
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setTitle('');
        setContent('');
        // Trigger post list refresh in parent component
        // This will depend on your state management approach
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-2 rounded-full">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Share Thoughts</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength="100"
          />
        </div>

        <div className="relative">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            maxLength={maxLength}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            {content.length}/{maxLength}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => {
              setTitle('');
              setContent('');
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareThoughts;
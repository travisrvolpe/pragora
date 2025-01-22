// src/pages/DiscussionList.js
import React, { useState, useEffect } from 'react';
import { Search, Filter, Menu } from 'lucide-react';
import TopBar from '../components/TopBar';
import TopicSection from '../components/TopicSection';

function DiscussionList() {
  const [discussions, setDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    'Nature & Environment',
    'Self-Development',
    'Home & Habitat',
    'Science & Technology',
    'Philosophy & Ethics',
    'Art & Culture',
    'Civic Engagement',
    'General Discussion'
  ];

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/discussions');
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        setDiscussions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  // Group discussions by category
  const getDiscussionsByCategory = (category) => {
    return discussions.filter(discussion => discussion.category === category);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-600 p-4">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="container mx-auto p-4">
        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Topic Name
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="p-2">
            <Filter className="h-5 w-5" />
          </button>
          <button className="p-2">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Discussion Categories */}
        {categories.map((category) => (
          <TopicSection
            key={category}
            title={category}
            posts={getDiscussionsByCategory(category)}
          />
        ))}
      </main>

      <footer className="text-center py-4 border-t">
        <p className="text-gray-600">Copyright © 2024 Website. All rights</p>
      </footer>
    </div>
  );
}

export default DiscussionList;
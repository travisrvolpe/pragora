// src/pages/DiscussionList.js
import React, { useState } from 'react';
import { Search, Filter, Menu } from 'lucide-react';
import TopBar from '../components/TopBar';
import TopicSection from '../components/TopicSection';
import '../styles/pages/DiscussionList.css';
function DiscussionList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Merged categories
  const categories = [
    'Nature & Environment',
    'Self-Development',
    'Home & Habitat',
    'Science & Technology',
    'Philosophy & Ethics',
    'Art & Culture',
    'Civic Engagement',
    'General Discussion',
  ];

  // Merged sample posts
  const samplePosts = [
    {
      id: 1,
      title: "Understanding Climate Change",
      overview: "A detailed analysis of recent climate trends and their implications...",
      date: "Jan 2024",
      category: "Nature & Environment",
      author: "Edward James",
      upvotes: 9,
      downvotes: 2
    },
    {
      id: 2,
      title: "Effective Goal Setting",
      overview: "How to set and achieve meaningful personal and professional goals...",
      date: "Jan 2024",
      category: "Self-Development",
      author: "Sarah Chen",
      upvotes: 15,
      downvotes: 1
    },
    {
      id: 3,
      title: "Sustainable Home Design",
      overview: "Innovative approaches to creating environmentally conscious living spaces...",
      date: "Jan 2024",
      category: "Home & Habitat",
      author: "Alex Johnson",
      upvotes: 12,
      downvotes: 3
    },
    // From the second snippet
    {
      id: 4,
      title: "Another Post Example",
      overview: "Just a quick demonstration post from the second snippet's data...",
      date: "Jan 2024",
      category: "Nature & Environment",
      author: "Edward James",
      upvotes: 9,
      downvotes: 2
    }
  ];

  // Filter posts by selected category (if any) and search query
  const filteredPosts = samplePosts.filter((post) => {
    const matchesCategory = selectedCategory
      ? post.category === selectedCategory
      : true;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.overview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group filtered posts by category
  const getDiscussionsByCategory = (category) => {
    return filteredPosts.filter((post) => post.category === category);
  };

  // Handle category click in sidebar
  const handleCategoryClick = (category) => {
    // If user clicks the same category again, reset (show all)
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar from first snippet */}
      <TopBar />

      <main className="container mx-auto p-4">
        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Topic Name
          </button>

          {/* Search input */}
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

          {/* Filter and Menu icons */}
          <button className="p-2">
            <Filter className="h-5 w-5" />
          </button>
          <button className="p-2">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-8">
          {/* Category Sidebar (from second snippet) */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
              <h2 className="font-semibold">Topics</h2>
            </div>
            <div className="bg-white rounded-b-lg shadow">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100
                    last:border-b-0 transition-colors duration-200
                    ${selectedCategory === category ? 'bg-gray-100' : ''}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Discussion Categories (TopicSections) or single category if selected */}
          <div className="flex-1">
            {selectedCategory ? (
              <TopicSection
                key={selectedCategory}
                title={selectedCategory}
                posts={getDiscussionsByCategory(selectedCategory)}
              />
            ) : (
              categories.map((category) => (
                <TopicSection
                  key={category}
                  title={category}
                  posts={getDiscussionsByCategory(category)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer from first snippet */}
      <footer className="text-center py-4 border-t">
        <p className="text-gray-600">Copyright © 2024 Website. All rights.</p>
      </footer>
    </div>
  );
}

export default DiscussionList;

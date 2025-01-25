// src/components/TopicSection.jsx
import React from 'react';
import PostCard from './PostCard';

const TopicSection = ({ title, posts }) => (
  <div className="mb-8">
    <div className="bg-blue-600 text-white px-4 py-2 mb-4">
      <h2 className="font-medium">{title}</h2>
    </div>
    {posts.map((post) => (
      <PostCard key={post.id} post={post} />
    ))}
  </div>
);

export default TopicSection;
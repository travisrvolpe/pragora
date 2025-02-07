import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, Bookmark, Share2 } from 'lucide-react';

const LongPost = () => {
  return (
    <Card className="max-w-2xl bg-white">
      {/* Featured Image */}
      <div className="relative w-full h-64 bg-gray-100">
        <img
          src="/api/placeholder/800/400"
          alt="Featured image"
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-6">
        {/* Author Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">Tech Insights Weekly</h3>
              <div className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                Subscribed
              </div>
            </div>
            <p className="text-sm text-gray-600">By David Kumar • Jan 25, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            The Future of AI: Breaking Down the Latest Breakthroughs in Machine Learning
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-600">
            An in-depth analysis of recent developments in artificial intelligence and their implications for the tech industry
          </p>

          {/* Reading Time & Topics */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>8 min read</span>
            </div>
            <div className="flex items-center">
              <BookOpen size={16} className="mr-1" />
              <span>Technology, AI</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="prose prose-gray max-w-none text-gray-600 line-clamp-3">
            <p>
              The landscape of artificial intelligence is evolving at an unprecedented pace. In the past year alone, we've witnessed remarkable breakthroughs in neural networks, natural language processing, and computer vision. This article delves into these advancements and explores their potential impact on various industries...
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              {/* Read More Button */}
              <button className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
                Read More
              </button>

              {/* Save Button */}
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Bookmark size={18} />
                <span>Save</span>
              </button>
            </div>

            {/* Share */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4">
            <span>2.1K views</span>
            <span>•</span>
            <span>156 comments</span>
            <span>•</span>
            <span>43 shares</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LongPost;
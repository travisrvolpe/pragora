import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, Music2, BadgeCheck } from 'lucide-react';

const FeedDemo = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 bg-gray-50">
      {/* Short Text Post (Twitter-style) */}
      <Card className="bg-white">
        <div className="p-4">
          {/* Author Header */}
          <div className="flex justify-between">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100" />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">Sarah Chen</span>
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-500">@sarahchen</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">2h</span>
                </div>
                <p className="mt-2">
                  Just had a breakthrough moment working on our new AI project! 🤖✨ The model's performance improved by 40% after implementing that new training approach we discussed last week.
                </p>
                <p className="mt-1 text-blue-500">#AI #MachineLearning</p>
              </div>
            </div>
          </div>
          {/* Engagement */}
          <div className="flex justify-between mt-4 text-gray-500">
            <div className="flex space-x-12">
              <div className="flex items-center space-x-2">
                <Heart size={18} /> <span>1.2K</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle size={18} /> <span>48</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 size={18} /> <span>24</span>
              </div>
            </div>
            <Bookmark size={18} />
          </div>
        </div>
      </Card>

      {/* Image Post (Instagram-style) */}
      <Card className="bg-white">
        <div className="p-4 pb-0">
          {/* Author Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200" />
              </div>
            </div>
            <span className="font-semibold">photography_plus</span>
          </div>
        </div>

        {/* Image */}
        <div className="aspect-square bg-gray-100">
          <img
            src="/api/placeholder/600/600"
            alt="Nature photograph"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          {/* Engagement */}
          <div className="flex justify-between mb-2">
            <div className="flex space-x-4">
              <Heart size={24} className="text-red-500" fill="currentColor" />
              <MessageCircle size={24} />
              <Share2 size={24} />
            </div>
            <Bookmark size={24} />
          </div>
          <div className="font-semibold mb-1">3,742 likes</div>
          <div>
            <span className="font-semibold">photography_plus</span>
            <span className="ml-2">Sunset at the perfect moment 🌅</span>
          </div>
        </div>
      </Card>

      {/* Long Form Post (Substack-style) */}
      <Card className="bg-white">
        <div className="h-48 bg-gray-100">
          <img
            src="/api/placeholder/800/400"
            alt="Article cover"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <div className="font-semibold">Tech Insights Weekly</div>
              <div className="text-sm text-gray-500">By David Kumar</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">The Future of AI: Breaking Down the Latest Breakthroughs</h2>
          <p className="text-gray-600 mb-4">An in-depth analysis of recent developments in artificial intelligence and their implications for the tech industry...</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>8 min read</span>
            <span className="mx-2">·</span>
            <span>Technology</span>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-full">Read More</button>
        </div>
      </Card>

      {/* Video Post (TikTok/Reels-style) */}
      <Card className="bg-black">
        <div className="relative aspect-[9/16] bg-gray-800">
          <img
            src="/api/placeholder/400/720"
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />

          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="text-white">@dancepro</div>
            </div>
            <p className="text-white mb-2">New dance routine! 💃 #dance #viral</p>
            <div className="flex items-center space-x-2 text-white">
              <Music2 size={16} />
              <span className="text-sm">Original Sound - dancepro</span>
            </div>
          </div>

          {/* Side Actions */}
          <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20">
                <Heart size={24} className="text-white" />
              </div>
              <span className="text-white text-sm mt-1">127.4K</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20">
                <MessageCircle size={24} className="text-white" />
              </div>
              <span className="text-white text-sm mt-1">1,242</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20">
                <Bookmark size={24} className="text-white" />
              </div>
              <span className="text-white text-sm mt-1">Save</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeedDemo;
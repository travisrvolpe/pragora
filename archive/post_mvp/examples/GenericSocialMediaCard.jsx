import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';

const ContentCard = () => {
  return (
    <Card className="max-w-xl bg-white rounded-lg shadow">
      {/* Author Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div>
            <h3 className="font-semibold text-gray-900">Jane Cooper</h3>
            <p className="text-sm text-gray-500">@janecooper • 2h ago</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <CardContent className="px-4 pb-4">
        <p className="text-gray-800 mb-4">
          Just wrapped up an amazing workshop on sustainable design! 🌿 The energy in the room was incredible, and I'm blown away by all the innovative ideas shared today. #DesignThinking #Sustainability
        </p>

        {/* Image Placeholder */}
        <div className="rounded-lg bg-gray-100 w-full h-64 mb-4" />

        {/* Engagement Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
          <span>124 likes</span>
          <span>28 comments</span>
          <span>12 shares</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
              <Heart size={20} />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
              <MessageCircle size={20} />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <Bookmark size={20} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
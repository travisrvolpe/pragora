import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from 'lucide-react';

const ImagePost = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Card className="max-w-md bg-white rounded-none border-b">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              <div className="w-full h-full rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-sm">photolover</span>
            <span className="mx-1 text-sm">•</span>
            <span className="text-sm text-gray-500">2h</span>
          </div>
        </div>
        <button className="text-gray-900">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src="/api/placeholder/600/600"
          alt="Post content"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action Buttons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-900 hover:text-gray-600"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                size={24}
                fill={isLiked ? "#ef4444" : "none"}
                className={isLiked ? "text-red-500" : ""}
              />
            </button>
            <button className="text-gray-900 hover:text-gray-600">
              <MessageCircle size={24} />
            </button>
            <button className="text-gray-900 hover:text-gray-600">
              <Send size={24} />
            </button>
          </div>
          <button
            className="text-gray-900 hover:text-gray-600"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark
              size={24}
              fill={isSaved ? "#000000" : "none"}
            />
          </button>
        </div>

        {/* Likes */}
        <div className="mb-2">
          <p className="font-semibold text-sm">1,234 likes</p>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <p className="text-sm">
            <span className="font-semibold mr-1">photolover</span>
            Captured this amazing sunset at the beach today! 🌅 The colors were absolutely incredible. Nature never fails to amaze me. #photography #sunset #naturephotography
          </p>
        </div>

        {/* Comments Preview */}
        <button className="text-gray-500 text-sm mb-1">
          View all 48 comments
        </button>
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-semibold mr-1">user123</span>
            Stunning shot! 😍
          </div>
          <div className="text-sm">
            <span className="font-semibold mr-1">nature_lover</span>
            The colors are amazing!
          </div>
        </div>

        {/* Add Comment */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full text-sm bg-transparent focus:outline-none"
            />
            <button className="text-blue-500 font-semibold text-sm ml-2">
              Post
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImagePost;
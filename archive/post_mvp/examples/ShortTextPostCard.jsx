import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  BadgeCheck
} from 'lucide-react';

const ShortPost = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  // Engagement counts
  const [likeCount, setLikeCount] = useState(42);
  const [repostCount, setRepostCount] = useState(12);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setRepostCount(prev => isReposted ? prev - 1 : prev + 1);
  };

  return (
    <Card className="max-w-xl bg-white hover:bg-gray-50 transition-colors duration-200">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex justify-between">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

            <div className="flex-1">
              {/* User Info */}
              <div className="flex items-center space-x-1">
                <span className="font-bold text-gray-900 hover:underline">
                  Sarah Chen
                </span>
                <BadgeCheck className="w-4 h-4 text-blue-500" />
                <span className="text-gray-500">@sarahchen</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 hover:underline">2h</span>
              </div>

              {/* Post Content */}
              <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                Just had a breakthrough moment working on our new AI project! 🤖✨ The model's performance improved by 40% after implementing that new training approach we discussed last week. Sometimes the simplest solutions yield the best results.

                #AI #MachineLearning #Innovation
              </div>

              {/* Thread Indicator */}
              <div className="mt-2 text-blue-600 text-sm hover:underline cursor-pointer">
                Show this thread
              </div>

              {/* Engagement Actions */}
              <div className="flex items-center justify-between mt-3 max-w-md">
                {/* Comment */}
                <button className="group flex items-center text-gray-500 hover:text-blue-600">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-blue-100">
                    <MessageCircle size={18} />
                  </div>
                  <span className="ml-1 text-sm">24</span>
                </button>

                {/* Repost */}
                <button
                  className={`group flex items-center ${isReposted ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
                  onClick={handleRepost}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-green-100">
                    <Repeat2 size={18} />
                  </div>
                  <span className="ml-1 text-sm">{repostCount}</span>
                </button>

                {/* Like */}
                <button
                  className={`group flex items-center ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                  onClick={handleLike}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-red-100">
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  </div>
                  <span className="ml-1 text-sm">{likeCount}</span>
                </button>

                {/* Share */}
                <button className="group flex items-center text-gray-500 hover:text-blue-600">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-blue-100">
                    <Share size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* More Actions */}
          <button className="text-gray-500 hover:text-gray-900">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortPost;
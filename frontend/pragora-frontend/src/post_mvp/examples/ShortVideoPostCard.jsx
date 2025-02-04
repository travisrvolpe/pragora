import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Forward,
  RotateCcw,
  Sparkles,
  Sticker,
  HashIcon,
  Globe2,
  Gift,
  Palette
} from 'lucide-react';

const VideoPost = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEffectsOpen, setIsEffectsOpen] = useState(false);
  const [progress, setProgress] = useState(45); // Simulated video progress

  // Simulated video segments/chapters
  const segments = [
    { id: 1, duration: 30, completed: true },
    { id: 2, duration: 15, completed: true },
    { id: 3, duration: 20, completed: false },
  ];

  return (
    <Card className="max-w-sm bg-black relative h-[800px]">
      {/* Video Container */}
      <div className="relative h-full bg-gray-900">
        {/* Video Placeholder */}
        <div className="absolute inset-0 bg-gray-800">
          <img
            src="/api/placeholder/400/800"
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />

          {/* Video Progress Bar */}
          <div className="absolute top-0 left-0 right-0 flex space-x-1 p-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="h-1 flex-1 bg-gray-400/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white ${
                    segment.completed ? 'w-full' : 'w-1/3'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Play/Pause Overlay */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors group"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {!isPlaying ? (
                <Play size={48} className="text-white/80" />
              ) : (
                <Pause size={48} className="text-white/80" />
              )}
            </div>
          </button>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col items-end space-y-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg"
          >
            {isMuted ? (
              <VolumeX size={20} className="text-white" />
            ) : (
              <Volume2 size={20} className="text-white" />
            )}
          </button>

          {/* Effects Button */}
          <button
            onClick={() => setIsEffectsOpen(!isEffectsOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg"
          >
            <Sparkles size={20} className="text-white" />
          </button>
        </div>

        {/* Effects Panel */}
        {isEffectsOpen && (
          <div className="absolute top-20 right-4 bg-black/40 backdrop-blur-lg rounded-2xl p-4">
            <div className="flex flex-col space-y-4">
              <button className="flex items-center space-x-2 text-white">
                <Palette size={20} />
                <span>Filters</span>
              </button>
              <button className="flex items-center space-x-2 text-white">
                <Sticker size={20} />
                <span>Stickers</span>
              </button>
              <button className="flex items-center space-x-2 text-white">
                <HashIcon size={20} />
                <span>Tags</span>
              </button>
            </div>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-200 ring-2 ring-white" />
            <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              Follow
            </button>
          </div>

          {/* Like Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="group flex flex-col items-center"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg group-hover:bg-black/40">
              <Heart
                size={28}
                className={`${isLiked ? 'text-red-500' : 'text-white'} transform group-hover:scale-110 transition-transform`}
                fill={isLiked ? "currentColor" : "none"}
              />
            </div>
            <span className="text-white text-sm mt-1">127.4K</span>
          </button>

          {/* Comments Button */}
          <button className="group flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg group-hover:bg-black/40">
              <MessageCircle
                size={28}
                className="text-white transform group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-white text-sm mt-1">1,242</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="group flex flex-col items-center"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg group-hover:bg-black/40">
              <Bookmark
                size={28}
                className="text-white transform group-hover:scale-110 transition-transform"
                fill={isSaved ? "currentColor" : "none"}
              />
            </div>
            <span className="text-white text-sm mt-1">23.1K</span>
          </button>

          {/* Share Button */}
          <button className="group flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg group-hover:bg-black/40">
              <Share2
                size={28}
                className="text-white transform group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-white text-sm mt-1">Share</span>
          </button>

          {/* Gift Button */}
          <button className="group flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-lg group-hover:bg-black/40">
              <Gift
                size={28}
                className="text-white transform group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-white text-sm mt-1">Gift</span>
          </button>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">@dancepro</span>
              <span className="text-white/60">•</span>
              <span className="text-white/60">2h ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe2 size={16} className="text-white/60" />
              <span className="text-white/60">Public</span>
            </div>
          </div>

          {/* Caption */}
          <p className="text-white mb-4 leading-normal">
            New dance routine dropped! 💃 This one took forever to perfect but I'm so happy with how it turned out! Let me know what you think in the comments!
            <br/>
            <span className="text-blue-400">#dance #viral #newtrend #choreography</span>
          </p>

          {/* Sound Track */}
          <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-lg rounded-full py-2 px-4">
            <Music2 size={16} className="text-white" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                Original Sound - dancepro
              </p>
              <p className="text-white/60 text-xs">
                Length: 0:45 • Trending
              </p>
            </div>
            <button className="text-white text-sm font-medium">
              Use
            </button>
          </div>
        </div>

        {/* Video Progress */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400/30">
          <div
            className="h-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default VideoPost;
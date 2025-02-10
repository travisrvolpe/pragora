// components/posts/ImagePostCard.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BasePostCard } from './BasePostCard';
import type { PostCardProps } from '../../types/posts/component-types';
import type { Post, ImagePost } from '../../types/posts/post-types';
import { cn } from '../../lib/utils/utils';

const isImagePost = (post: Post): post is ImagePost => {
  return post.post_type_id === 2;
};

export const ImagePostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'feed',
  className,
  ...props
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Process image URLs with type guard
  const allImages = React.useMemo(() => {
    if (!isImagePost(post)) return [];

    const images = post.images || (post.image_url ? [post.image_url] : []);
    return images.map(url =>
      url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`
    );
  }, [post]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageLoaded(false);
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setImageLoaded(false);
    }
  };

  const ImageContainer = ({ zoomedView = false }) => (
    <div
      className={cn(
        "relative w-full",
        zoomedView ? '' : 'bg-gray-100'
      )}
    >
      <img
        src={allImages[currentImageIndex]}
        alt={post.content || "Post image"}
        className={cn(
          "w-full object-contain transition-opacity duration-300",
          zoomedView ? 'max-h-screen' : 'max-h-[600px] min-h-[300px]',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading image...</div>
        </div>
      )}

      {/* Navigation arrows */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentImageIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 transform -translate-y-1/2",
              "bg-black/20 rounded-full p-2 text-white transition-all",
              currentImageIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-black/40"
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentImageIndex === allImages.length - 1}
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2",
              "bg-black/20 rounded-full p-2 text-white transition-all",
              currentImageIndex === allImages.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-black/40"
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image counter */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
          bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  );

  return (
    <BasePostCard
      post={post}
      variant={variant}
      className={cn('image-post', className)}
      {...props}
    >
      <div className="cursor-zoom-in" onClick={() => setIsZoomed(true)}>
        <ImageContainer />
      </div>

      {/* Caption */}
      {post.content && (
        <div className="mt-4">
          <p className="text-gray-900">{post.content}</p>
        </div>
      )}

      {/* Zoomed image overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            onClick={() => setIsZoomed(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-7xl w-full mx-auto px-4">
            <ImageContainer zoomedView />
          </div>
        </div>
      )}
    </BasePostCard>
  );
};

export default ImagePostCard;
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import PostWrapper from '../PostWrapper';

const ImagePostCard = ({
  post,

  onLike,
  onDislike,
  onSave,
  onShare,
  onComment,
  onThreadedReply,
  onView,
  onFollow,
  onConnect,
  onReport,
  onLove,
  onHate
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Process image URLs
  const allImages = React.useMemo(() => {
    const images = post.images || (post.image_url ? [post.image_url] : []);
    return images.map(url =>
      url?.startsWith('http') ? url : `http://localhost:8000${url}`
    );
  }, [post.images, post.image_url]);

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageLoaded(false);
    }
  };

  const handlePrevious = (e) => {
    e?.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setImageLoaded(false);
    }
  };

  const ImageContainer = ({ zoomedView = false }) => (
    <div className={`relative w-full ${zoomedView ? '' : 'bg-gray-100'}`}>
      <img
        src={allImages[currentImageIndex]}
        alt={post.caption || "Post content"}
        className={`w-full object-contain ${
          zoomedView ? 'max-h-screen' : 'max-h-[600px] min-h-[300px]'
        } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.3s ease-in-out' }}
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
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 
              ${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/40'}
              bg-black/20 rounded-full p-2 text-white transition-all`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentImageIndex === allImages.length - 1}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 
              ${currentImageIndex === allImages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/40'}
              bg-black/20 rounded-full p-2 text-white transition-all`}
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
    <PostWrapper
      post={post}
      onLike={onLike}
      onDislike={onDislike}
      onSave={onSave}
      onShare={onShare}
      onComment={onComment}
      onThreadedReply={onThreadedReply}
      onView={onView}
      onFollow={onFollow}
      onConnect={onConnect}
      onReport={onReport}
      onLove={onLove}
      onHate={onHate}
    >
      <div className="cursor-zoom-in" onClick={() => setIsZoomed(true)}>
        <ImageContainer />
      </div>

      {/* Caption */}
      {post.content && (
        <div className="px-4 py-3">
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
          <div className="max-w-7xl w-full mx-auto">
            <ImageContainer zoomedView />
          </div>
        </div>
      )}
    </PostWrapper>
  );
};

export default ImagePostCard;
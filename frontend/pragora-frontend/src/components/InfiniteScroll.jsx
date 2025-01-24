import React, { useEffect, useRef, useCallback } from 'react';

export const InfiniteScroll = ({ children, loadMore, hasMore, isLoading }) => {
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  return (
    <div className="infinite-scroll-wrapper">
      {children}
      <div ref={lastElementRef} className="load-more-trigger">
        {isLoading && hasMore && (
          <div className="loading-indicator">Loading more...</div>
        )}
      </div>
    </div>
  );
};
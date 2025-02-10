// components/InfiniteScroll.tsx
'use client'

import React, { useEffect, useRef, useCallback } from 'react'

interface InfiniteScrollProps {
  children: React.ReactNode
  loadMore: () => void
  hasMore: boolean
  isLoading: boolean
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loadMore,
  hasMore,
  isLoading
}) => {
  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })

    if (node) observer.current.observe(node)
  }, [isLoading, hasMore, loadMore])

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="infinite-scroll-wrapper">
      {children}
      <div ref={lastElementRef} className="load-more-trigger">
        {isLoading && hasMore && (
          <div className="loading-indicator flex justify-center p-4">
            Loading more...
          </div>
        )}
      </div>
    </div>
  )
}

export default InfiniteScroll
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
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(isLoading)
  const hasMoreRef = useRef(hasMore)

  // Update refs when props change
  useEffect(() => {
    loadingRef.current = isLoading
    hasMoreRef.current = hasMore
  }, [isLoading, hasMore])

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || loadingRef.current || !hasMoreRef.current) return

    const scrollPosition = window.innerHeight + window.scrollY
    const scrollThreshold = document.documentElement.scrollHeight - 800

    console.log('Scroll Debug:', {
      scrollPosition,
      threshold: scrollThreshold,
      windowHeight: window.innerHeight,
      scrollY: window.scrollY,
      documentHeight: document.documentElement.scrollHeight
    })

    if (scrollPosition >= scrollThreshold) {
      console.log('InfiniteScroll Debug - Scroll threshold reached, loading more')
      loadMore()
    }
  }, [loadMore])

  useEffect(() => {
    const throttledScroll = () => {
      if (loadMoreTimeoutRef.current) return
      loadMoreTimeoutRef.current = setTimeout(() => {
        handleScroll()
        loadMoreTimeoutRef.current = null
      }, 100)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [handleScroll])

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    console.log('InfiniteScroll Debug - Observer setup:', {
      node: !!node,
      isLoading,
      hasMore
    })

    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(entries => {
      console.log('InfiniteScroll Debug - Intersection detected:', {
        isIntersecting: entries[0].isIntersecting,
        hasMore,
        isLoading
      })

      if (entries[0].isIntersecting && hasMore && !isLoading) {
        console.log('InfiniteScroll Debug - Triggering loadMore from observer')
        loadMore()
      }
    }, {
      root: null,
      rootMargin: '400px',
      threshold: 0
    })

    if (node) {
      observer.current.observe(node)
    }
  }, [isLoading, hasMore, loadMore])

  return (
    <div ref={scrollContainerRef} className="infinite-scroll-wrapper">
      {children}
      <div
        ref={lastElementRef}
        className="load-more-trigger py-8 flex items-center justify-center"
        style={{ minHeight: '100px' }}
      >
        {isLoading && (
          <div className="loading-indicator p-4 text-gray-600">
            Loading more posts...
          </div>
        )}
        {!isLoading && hasMore && (
          <div className="text-sm text-gray-500">
            Scroll for more posts
          </div>
        )}
      </div>
    </div>
  )
}
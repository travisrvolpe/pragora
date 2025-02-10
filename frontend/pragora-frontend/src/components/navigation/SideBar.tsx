// src/components/navigation/Sidebar.tsx
'use client'

import React from "react"
import { usePathname } from 'next/navigation'
import { SidebarProps } from '@/types/layout'
import TopicCard from "@/components/posts/TopicCard"

export function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onSubcategoryChange
}: SidebarProps) {
  const pathname = usePathname()

  const getSidebarContent = () => {
    if (pathname.startsWith("/dialectica")) {
      return categories.map((category) => (
        <TopicCard
          key={category.id}
          category={category}
          isSelected={selectedCategory === category.id}
          onSelect={onSelectCategory}
          subcategories={category.subcategories}
          onSubcategoryChange={onSubcategoryChange}
        />
      ))
    } else if (pathname.startsWith("/tap")) {
      return <p className="sidebar-placeholder">TAP Sidebar Content</p>
    } else if (pathname.startsWith("/pan")) {
      return <p className="sidebar-placeholder">PAN Sidebar Content</p>
    } else {
      return <p className="sidebar-placeholder">General Sidebar Content</p>
    }
  }

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Navigation</h3>
      {getSidebarContent()}
    </div>
  )
}
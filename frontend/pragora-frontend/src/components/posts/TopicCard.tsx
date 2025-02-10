// components/posts/TopicCard.tsx
'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '../../lib/utils/utils'
import type { TopicCardProps } from '@/types/posts/page-types'

export const TopicCard = ({
  category,
  isSelected,
  selectedSubcategory
}: TopicCardProps) => {
  const [localSelectedSubcategory, setLocalSelectedSubcategory] = React.useState<number | undefined>(
    selectedSubcategory
  )

  const handleSubcategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const value = Number(e.target.value)
    setLocalSelectedSubcategory(value)
    // You can use router.push() here to change the URL with the new filter
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{category.cat_name}</h3>

          {isSelected && category.subcategories && category.subcategories.length > 0 && (
            <select
              className="text-sm border rounded-md px-2 py-1 bg-white"
              value={localSelectedSubcategory || ''}
              onChange={handleSubcategoryChange}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">All Subcategories</option>
              {category.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {category.description && (
          <p className="text-sm text-gray-600">{category.description}</p>
        )}

        {!isSelected && category.subcategories && category.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {category.subcategories.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {sub.name}
              </span>
            ))}
            {category.subcategories.length > 3 && (
              <span className="text-xs text-gray-500">
                +{category.subcategories.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default TopicCard
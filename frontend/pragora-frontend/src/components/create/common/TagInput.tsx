// components/create/common/TagInput.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils/utils';
import { Button } from '@/components/ui/button';
import { TagInputProps } from '../../../types/posts/create-content-types';

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  className
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={30}
        />
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!newTag.trim()}
          className="whitespace-nowrap"
        >
          Add Tag
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100
                       text-gray-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
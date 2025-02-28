// components/create/common/MediaUploader.tsx
'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/applib/utils/utils';
import { MediaUploaderProps } from '../../../types/posts/create-content-types';

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  images,
  onUpload,
  onRemove,
  maxImages = 4,
  className
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white
                         opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div className="text-center">
          <label className="cursor-pointer inline-block w-full">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg
                        hover:border-blue-500 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">
                Click to upload images ({maxImages - images.length} remaining)
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Supported formats: JPG, PNG, GIF
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
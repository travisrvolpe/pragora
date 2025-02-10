// components/create/forms/ImageForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Image } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagePostFormData, FormattedImage } from '../../../types/posts/create-content-types';
import { CategorySelector } from '../common/CategorySelector';
import { TagInput } from '../common/TagInput';
import { MediaUploader } from '../common/MediaUploader';

interface ImageFormProps {
  onSubmit: (data: FormData) => Promise<{ post_id: number }>;
  maxImages?: number;
  maxCaptionLength?: number;
  initialData?: Partial<ImagePostFormData>;
  className?: string;
}

export const ImageForm = React.forwardRef<HTMLFormElement, ImageFormProps>(({
  onSubmit,
  maxImages = 4,
  maxCaptionLength = 500,
  initialData,
  className
}, ref) => {
  const router = useRouter();

  const [formData, setFormData] = useState<ImagePostFormData>({
    content: '',
    caption: '',
    category_id: '',
    subcategory_id: '',
    custom_subcategory: '',
    tags: [],
    post_type_id: 2,
    ...initialData
  });

  const [images, setImages] = useState<FormattedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (files: FileList) => {
    if (files.length === 0) return;

    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    if (images.length + newImages.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Required fields
      submitData.append('post_type_id', String(formData.post_type_id));
      submitData.append('content', formData.content || formData.caption || 'Image post');

      // Optional fields
      if (formData.caption?.trim()) {
        submitData.append('caption', formData.caption.trim());
      }

      if (formData.category_id) {
        submitData.append('category_id', formData.category_id);
      }

      if (formData.subcategory_id) {
        submitData.append('subcategory_id', formData.subcategory_id);
      }

      if (formData.custom_subcategory?.trim()) {
        submitData.append('custom_subcategory', formData.custom_subcategory.trim());
      }

      // Add images
      images.forEach((image, index) => {
        submitData.append('files', image.file);
      });

      // Add tags
      formData.tags.forEach(tag => {
        submitData.append('tags', tag);
      });

      const response = await onSubmit(submitData);
      router.push(`/post/${response.post_id}`);
    } catch (error) {
      console.error('Error creating image post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    // Clean up image previews
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });

    setImages([]);
    setFormData({
      content: '',
      caption: '',
      category_id: '',
      subcategory_id: '',
      custom_subcategory: '',
      tags: [],
      post_type_id: 2
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
        <MediaUploader
          images={images}
          onUpload={handleImageUpload}
          onRemove={removeImage}
          maxImages={maxImages}
        />

        <div className="relative">
          <textarea
            name="caption"
            placeholder="Add a caption..."
            value={formData.caption}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            maxLength={maxCaptionLength}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            {formData.caption.length}/{maxCaptionLength}
          </div>
        </div>

        <CategorySelector
          selectedCategory={formData.category_id}
          selectedSubcategory={formData.subcategory_id}
          onCategoryChange={(value) => setFormData(prev => ({
            ...prev,
            category_id: value,
            subcategory_id: ''
          }))}
          onSubcategoryChange={(value) => setFormData(prev => ({
            ...prev,
            subcategory_id: value
          }))}
        />

        {!formData.subcategory_id && (
          <input
            type="text"
            name="custom_subcategory"
            placeholder="Custom Subcategory (optional)"
            value={formData.custom_subcategory}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <TagInput
          tags={formData.tags}
          onAddTag={(tag) => setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, tag]
          }))}
          onRemoveTag={(tag) => setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
          }))}
        />

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={images.length === 0 || isSubmitting}
            isLoading={isSubmitting}
          >
            Share
          </Button>
        </div>
      </form>
    </Card>
  );
});

ImageForm.displayName = 'ImageForm';

export default ImageForm;
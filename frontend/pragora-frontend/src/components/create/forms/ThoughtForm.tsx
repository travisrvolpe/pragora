// components/create/forms/ThoughtForm.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/applib/hooks/use-toast/use-toast';
import { ThoughtPostFormData } from '@/types/posts/create-content-types';
import { CategorySelector } from '../common/CategorySelector';
import { TagInput } from '../common/TagInput';

interface ThoughtFormProps {
  onSubmit: (data: FormData) => Promise<{ post_id: number }>;
  maxTitleLength?: number;
  maxContentLength?: number;
  initialData?: Partial<ThoughtPostFormData>;
  className?: string;
}

export const ThoughtForm = React.forwardRef<HTMLFormElement, ThoughtFormProps>(({
  onSubmit,
  maxTitleLength = 100,
  maxContentLength = 2000,
  initialData,
  className
}, ref) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ThoughtPostFormData>({
    title: '',
    content: '',
    category_id: '',
    subcategory_id: '',
    custom_subcategory: '',
    tags: [],
    post_type_id: 1,
    ...initialData
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Inside ThoughtForm component
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your thought",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Required fields
      submitData.append('post_type_id', String(formData.post_type_id));
      submitData.append('content', formData.content.trim());

      // Initialize tags array
      submitData.append('tags', '[]');  // Default empty array as string

      // Optional fields
      if (formData.title?.trim()) {
        submitData.append('title', formData.title.trim());
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

      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(tag => {
          submitData.append('tags', tag);
        });
      }

      console.log('Submitting form data:', {
        content: formData.content.trim(),
        post_type_id: String(formData.post_type_id),
        tags: formData.tags || []
      });

      const response = await onSubmit(submitData);

      if (!response?.post_id) {
        throw new Error('Invalid response format');
      }

      toast({
        title: "Success",
        description: "Thought posted successfully",
      });

      router.push(`/dialectica/${response.post_id}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      content: '',
      category_id: '',
      subcategory_id: '',
      custom_subcategory: '',
      tags: [],
      post_type_id: 1
    });
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
        {/* Rest of the form JSX remains the same */}
        <div>
          <input
            type="text"
            name="title"
            placeholder="Title (optional)"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={maxTitleLength}
          />
        </div>

        <div className="relative">
          <textarea
            name="content"
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            maxLength={maxContentLength}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            {formData.content.length}/{maxContentLength}
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
            disabled={!formData.content.trim() || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </form>
    </Card>
  );
});

ThoughtForm.displayName = 'ThoughtForm';

export default ThoughtForm;
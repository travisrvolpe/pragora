// components/create/forms/ArticleForm.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Bold,
  Italic,
  Code,
  Quote,
  Link as LinkIcon,
  Image,
  ListOrdered,
  List,
  Heading1,
  Heading2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArticlePostFormData } from '../../../types/posts/create-content-types';
import { CategorySelector } from '../common/CategorySelector';
import { TagInput } from '../common/TagInput';
import { MediaUploader } from '../common/MediaUploader';

interface ArticleFormProps {
  onSubmit: (data: FormData) => Promise<{ post_id: number }>;
  maxTitleLength?: number;
  maxSubtitleLength?: number;
}

type RichTextCommand = 'bold' | 'italic' | 'formatBlock' | 'insertOrderedList' |
                      'insertUnorderedList' | 'createLink' | 'insertImage';

export const ArticleForm = React.forwardRef<HTMLFormElement, ArticleFormProps>(({
  onSubmit,
  maxTitleLength = 100,
  maxSubtitleLength = 150
}, ref) => {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<{ file: File; preview: string } | null>(null);
  const [formData, setFormData] = useState<ArticlePostFormData>({
    title: '',
    subtitle: '',
    content: '',
    category_id: '',
    subcategory_id: '',
    custom_subcategory: '',
    tags: [],
    post_type_id: 3,
    isDraft: false
  });

  // Execute command in rich text editor
  const execCommand = (command: RichTextCommand, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateContent();
    }
  };

  // Update content state when editor content changes
  const updateContent = () => {
    if (editorRef.current) {
      setFormData(prev => ({
        ...prev,
        content: editorRef.current?.innerHTML || ''
      }));
    }
  };

  const handleLinkClick = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImageUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      setCoverImage({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const removeCoverImage = () => {
    if (coverImage) {
      URL.revokeObjectURL(coverImage.preview);
      setCoverImage(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.content.trim()) {
      alert('Please add some content to your article');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('post_type_id', String(formData.post_type_id));
      submitData.append('content', formData.content);

      // Optional fields
      if (formData.title?.trim()) {
        submitData.append('title', formData.title.trim());
      }
      if (formData.subtitle?.trim()) {
        submitData.append('subtitle', formData.subtitle.trim());
      }
      if (formData.category_id) {
        submitData.append('category_id', formData.category_id);
      }
      if (formData.subcategory_id) {
        submitData.append('subcategory_id', formData.subcategory_id);
      }
      if (formData.custom_subcategory?.trim()) {
        submitData.append('custom_subcategory', formData.custom_subcategory);
      }

      // Add cover image if exists
      if (coverImage) {
        submitData.append('files', coverImage.file);
      }

      // Add tags
      formData.tags.forEach(tag => {
        submitData.append('tags', tag);
      });

      submitData.append('isDraft', String(formData.isDraft));

      const response = await onSubmit(submitData);
      router.push(`/post/${response.post_id}`);
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Failed to create article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (coverImage) {
        URL.revokeObjectURL(coverImage.preview);
      }
    };
  }, [coverImage]);

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} ref={ref} className="space-y-6">
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Article Title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full text-3xl font-bold p-2 border-b focus:outline-none focus:border-purple-500"
            maxLength={maxTitleLength}
          />

          <input
            type="text"
            name="subtitle"
            placeholder="Subtitle (optional)"
            value={formData.subtitle}
            onChange={handleInputChange}
            className="w-full text-xl p-2 border-b focus:outline-none focus:border-purple-500"
            maxLength={maxSubtitleLength}
          />
        </div>

        <div className="space-y-4">
          <MediaUploader
            images={coverImage ? [coverImage] : []}
            onUpload={handleImageUpload}
            onRemove={() => removeCoverImage()}
            maxImages={1}
          />

          {/* Rich Text Editor Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 border-b">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('bold')}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('italic')}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('formatBlock', 'h1')}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('formatBlock', 'h2')}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('insertOrderedList')}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('insertUnorderedList')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => execCommand('formatBlock', 'blockquote')}
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleLinkClick}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Rich Text Editor Content Area */}
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[400px] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formData.content }}
          />
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
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        <div className="flex justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isDraft}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                isDraft: e.target.checked
              }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">Save as draft</span>
          </label>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: '',
                  subtitle: '',
                  content: '',
                  category_id: '',
                  subcategory_id: '',
                  custom_subcategory: '',
                  tags: [],
                  post_type_id: 3,
                  isDraft: false
                });
                if (editorRef.current) {
                  editorRef.current.innerHTML = '';
                }
                removeCoverImage();
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={!formData.content.trim() || isSubmitting}
              isLoading={isSubmitting}
            >
              {formData.isDraft ? 'Save Draft' : 'Publish'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
});

ArticleForm.displayName = 'ArticleForm';

export default ArticleForm;
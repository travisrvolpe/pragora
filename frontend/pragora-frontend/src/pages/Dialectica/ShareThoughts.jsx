import React, { useState, useEffect } from 'react';
import { MessageCircle, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const testMinimalPost = async () => {
  const formData = new FormData();
  formData.append('post_type_id', '1');
  formData.append('content', 'Test post');

  const token = localStorage.getItem('access_token');
  try {
    const response = await axios.post('http://localhost:8000/posts/', formData, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Test post response:', response.data);
  } catch (error) {
    console.error('Test post error:', error.response?.data);
  }
};

const ShareThoughts = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category_id: '',
    subcategory_id: '',
    custom_subcategory: '',
    tags: [],
    post_type_id: 1,
    caption: '',
    video_url: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const maxLength = 2000;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/categories/');
        setCategories(response.data.data?.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.category_id) {
        try {
          const response = await axios.get(`http://localhost:8000/categories/${formData.category_id}/subcategories`);
          setSubcategories(response.data.data?.subcategories || []);
        } catch (error) {
          console.error('Failed to fetch subcategories:', error);
        }
      }
    };
    fetchSubcategories();
  }, [formData.category_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('access_token');
    console.log("Auth Token before submitting post:", token);

    console.log('Form data before submission:', formData);

    const submitFormData = new FormData();
    submitFormData.append('post_type_id', String(formData.post_type_id));
    submitFormData.append('content', formData.content);

    // Only append if the values exist and are not empty strings
    if (formData.title?.trim()) submitFormData.append('title', formData.title);
    if (formData.subtitle?.trim()) submitFormData.append('subtitle', formData.subtitle);

    // Handle category_id and subcategory_id properly
    if (formData.category_id) {
        const categoryId = parseInt(formData.category_id);
        if (!isNaN(categoryId)) {
            submitFormData.append('category_id', String(categoryId));
        }
    }
    if (formData.subcategory_id) {
        const subcategoryId = parseInt(formData.subcategory_id);
        if (!isNaN(subcategoryId)) {
            submitFormData.append('subcategory_id', String(subcategoryId));
        }
    }
    if (selectedFile) {
        submitFormData.append('files', selectedFile);
    }
    if (formData.tags.length > 0) {
        formData.tags.forEach(tag => {
            submitFormData.append('tags', tag);
        });
    }

    try {
        const token = localStorage.getItem('access_token');
        const response = await axios.post('http://localhost:8000/posts/', submitFormData, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Post creation response:', response.data);

        // Check for post_id in nested response data
        const post_id = response.data?.data?.post?.post_id ||
                       response.data?.post_id;

        if (post_id) {
            console.log('Navigating to post:', post_id);
            navigate(`/post/${post_id}`);
        } else {
            console.error('No post_id found in response:', response.data);
            alert('Post created but unable to navigate to it');
        }
    } catch (error) {
        console.error('Error creating post:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        alert(`Error: ${error.response?.data?.detail || 'Unknown error occurred'}`);
    } finally {
        setIsLoading(false);
    }
};
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-2 rounded-full">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Share Thoughts</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <input
            type="text"
            name="subtitle"
            placeholder="Subtitle (optional)"
            value={formData.subtitle}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <textarea
            name="content"
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            maxLength={maxLength}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            {formData.content.length}/{maxLength}
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {!selectedFile ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload an image</span>
              </label>
            ) : (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                  <option
                      key={category.category_id}
                      value={String(category.category_id)}  // Ensure value is string
                  >
                    {category.cat_name}
                  </option>
              ))}
            </select>
          </div>

          <div>
            <select
                name="subcategory_id"
                value={formData.subcategory_id || ''}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.category_id}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((subcategory) => (
                  <option
                      key={subcategory.subcategory_id}
                      value={String(subcategory.subcategory_id)}  // Ensure value is string
                  >
                    {subcategory.name}
                  </option>
              ))}
            </select>
          </div>
        </div>

        {!formData.subcategory_id && (
            <div>
              <input
                  type="text"
                  name="custom_subcategory"
                  placeholder="Custom Subcategory (optional)"
                  value={formData.custom_subcategory}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
        )}

        <div>
          <div className="flex gap-2">
            <input
                type="text"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {formData.tags.map((tag) => (
              <div
                key={tag}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
              type="button"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setFormData({
                  title: '',
                  subtitle: '',
                  content: '',
                  category_id: '',
                  subcategory_id: '',
                  custom_subcategory: '',
                  tags: [],
                  post_type_id: 1,
                  caption: '',
                  video_url: ''
                });
                setSelectedFile(null);
                setPreviewUrl('');
              }}
          >
            Clear
          </button>
          <button
              type="submit"
              disabled={!formData.content.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
          <button
              type="button"
              onClick={testMinimalPost}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Test Minimal Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareThoughts;
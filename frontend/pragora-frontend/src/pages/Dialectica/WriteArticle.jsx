import React, { useState, useEffect } from 'react';
import { BookOpen, Bold, Italic, Code, Quote, Heading1, Heading2, Link, Image, List, ListOrdered } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WriteArticle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category_id: '',
    subcategory_id: '',
    custom_subcategory: '',
    tags: [],
    isDraft: false,
    post_type_id: 3,
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the editor element
  const editorRef = React.useRef(null);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = () => {
    const content = editorRef.current.innerHTML;
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Rich text editing functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleEditorChange();
  };

  const handleLinkClick = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImageClick = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const submitFormData = new FormData();

    submitFormData.append('post_type_id', String(formData.post_type_id));
    submitFormData.append('content', formData.content);
    submitFormData.append('title', formData.title);

    if (formData.subtitle) submitFormData.append('subtitle', formData.subtitle);

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

    if (formData.custom_subcategory) {
      submitFormData.append('custom_subcategory', formData.custom_subcategory);
    }

    formData.tags.forEach(tag => {
      submitFormData.append('tags', tag);
    });

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:8000/posts/', submitFormData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success') {
        const post_id = response.data.data?.post?.post_id;
        if (post_id) {
          navigate(`/post/${post_id}`);
        }
      }
    } catch (error) {
      console.error('Failed to create article:', error.response?.data);
      alert('An error occurred while creating the article.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500 p-2 rounded-full">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Write Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Article Title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full text-3xl font-bold p-2 border-b focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="subtitle"
            placeholder="Subtitle (optional)"
            value={formData.subtitle}
            onChange={handleInputChange}
            className="w-full text-xl p-2 border-b focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Rich Text Editor Toolbar */}
        <div className="flex gap-2 p-2 border-b">
          <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-100 rounded">
            <Bold className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-100 rounded">
            <Italic className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} className="p-2 hover:bg-gray-100 rounded">
            <Heading1 className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} className="p-2 hover:bg-gray-100 rounded">
            <Heading2 className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-100 rounded">
            <ListOrdered className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded">
            <List className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => execCommand('formatBlock', '<blockquote>')} className="p-2 hover:bg-gray-100 rounded">
            <Quote className="w-5 h-5" />
          </button>
          <button type="button" onClick={handleLinkClick} className="p-2 hover:bg-gray-100 rounded">
            <Link className="w-5 h-5" />
          </button>
          <button type="button" onClick={handleImageClick} className="p-2 hover:bg-gray-100 rounded">
            <Image className="w-5 h-5" />
          </button>
        </div>

        {/* Rich Text Editor Content Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorChange}
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[300px]"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.cat_name}
              </option>
            ))}
          </select>
          <select
            name="subcategory_id"
            value={formData.subcategory_id}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            disabled={!formData.category_id}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            name="custom_subcategory"
            placeholder="Custom Subcategory (optional)"
            value={formData.custom_subcategory}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
            />
            <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-purple-500 text-white rounded-lg">
              Add
            </button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {formData.tags.map((tag) => (
              <div key={tag} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full flex items-center gap-2">
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
            onClick={() => {
              setFormData({
                title: '',
                subtitle: '',
                content: '',
                category_id: '',
                subcategory_id: '',
                custom_subcategory: '',
                tags: [],
                isDraft: false,
                post_type_id: 3,
              });
              if (editorRef.current) {
                editorRef.current.innerHTML = '';
              }
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!formData.title.trim() || !formData.content.trim() || isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
          >
            {isLoading ? 'Saving...' : formData.isDraft ? 'Save Draft' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteArticle;
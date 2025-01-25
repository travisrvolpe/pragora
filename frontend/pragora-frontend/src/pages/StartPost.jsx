import React, { useState } from 'react';
import { Shield, Tag, MessageSquare, Users, Link, Image } from 'lucide-react';

const StartPost = () => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [postType, setpostType] = useState('open');

  const postTypes = [
    { id: 'open', label: 'Open Post' },
    { id: 'structured', label: 'Structured Debate' },
    { id: 'qanda', label: 'Q&A' },
    { id: 'collaborative', label: 'Collaborative Analysis' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-500 p-2 rounded-full">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Start Post</h1>
      </div>

      <form className="space-y-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold p-3 border-b focus:outline-none focus:border-orange-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Topic</option>
                {/* Add topic options */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Topic</label>
              <select
                value={subTopic}
                onChange={(e) => setSubTopic(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Sub-Topic</option>
                {/* Add sub-topic options */}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setpostType(type.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors
                    ${postType === type.id 
                      ? 'bg-orange-50 border-orange-500 text-orange-700' 
                      : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
            <button type="button" className="p-2 hover:bg-gray-100 rounded">
              <Link className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded">
              <Image className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded">
              <Tag className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded">
              <Users className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          <textarea
            placeholder="What would you like to discuss?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 min-h-[300px] focus:outline-none"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Add tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Start Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default StartPost;
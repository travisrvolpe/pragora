import React, { useState } from 'react';
import {
  BookOpen, Bold, Italic, Code, List, Link, Image,
  Type, Heading1, Heading2, Quote, Undo, Redo,
  Headphones, Video, Table, MessageCircle
} from 'lucide-react';

const WriteArticle = () => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  const formatOptions = [
    { icon: <Bold className="w-4 h-4" />, tooltip: 'Bold' },
    { icon: <Italic className="w-4 h-4" />, tooltip: 'Italic' },
    { icon: <Code className="w-4 h-4" />, tooltip: 'Code' },
    { icon: <Quote className="w-4 h-4" />, tooltip: 'Quote' }
  ];

  const headerOptions = [
    { icon: <Heading1 className="w-4 h-4" />, tooltip: 'Heading 1' },
    { icon: <Heading2 className="w-4 h-4" />, tooltip: 'Heading 2' }
  ];

  const mediaOptions = [
    { icon: <Link className="w-4 h-4" />, tooltip: 'Add link' },
    { icon: <Image className="w-4 h-4" />, tooltip: 'Add image' },
    { icon: <Video className="w-4 h-4" />, tooltip: 'Add video' },
    { icon: <Headphones className="w-4 h-4" />, tooltip: 'Add audio' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, subtitle, content, tags, isDraft });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500 p-2 rounded-full">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Write Article</h1>
        </div>
        <MessageCircle className="w-6 h-6 text-gray-500 cursor-pointer hover:text-purple-500" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold p-2 border-b focus:outline-none focus:border-purple-500"
          />
          <input
            type="text"
            placeholder="Add a subtitle..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-xl text-gray-600 p-2 border-b focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="border rounded-lg">
          <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
            <div className="flex items-center gap-2 pr-2 border-r">
              <button type="button" className="p-1.5 hover:bg-gray-200 rounded">
                <Undo className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-200 rounded">
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-2 border-r">
              {headerOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded"
                  title={option.tooltip}
                >
                  {option.icon}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-2 border-r">
              {formatOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded"
                  title={option.tooltip}
                >
                  {option.icon}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-2 border-r">
              {mediaOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded"
                  title={option.tooltip}
                >
                  {option.icon}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="p-1.5 hover:bg-gray-200 rounded">
                <List className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-200 rounded">
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            placeholder="Start writing your article..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 min-h-[400px] focus:outline-none"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Add tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="w-4 h-4 text-purple-500"
            />
            <span className="text-gray-600">Save as draft</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setTitle('');
                setSubtitle('');
                setContent('');
                setTags('');
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isDraft ? 'Save Draft' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WriteArticle;
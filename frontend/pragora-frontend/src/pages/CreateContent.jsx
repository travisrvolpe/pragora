// src/components/PostOptions.js
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Image, BookOpen, Brain, Users, ChartBar } from 'lucide-react';
import "../styles/pages/CreateContent.css";


const PostOptions = () => {
  const basicOptions = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Share Thoughts",
      description: "Quick insights and updates",
      limit: "280 characters",
      color: "bg-blue-500",
      link: "/share-thoughts"
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Share Images",
      description: "Visual content with captions",
      limit: "Up to 4 images",
      color: "bg-green-500",
      link: "/share-image"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Write Article",
      description: "In-depth analysis and discussion",
      limit: "No length limit",
      color: "bg-purple-500",
        link: "/write-article" // Example route
    }
  ];

  /* Add 'personal' options - Journaling or Vision Board? or make these part of TAP? */

  const advancedOptions = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Start Discussion",
      description: "Structured debate and dialogue",
      color: "bg-orange-500",
     link: "/start-discussion" // Example route
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Project",
      description: "Collaborative initiatives",
      color: "bg-red-500",
        link: "/group-project" // Example route
    },
    {
      icon: <ChartBar className="w-8 h-8" />,
      title: "Share Research",
      description: "Data-driven insights",
      color: "bg-indigo-500",
       link: "/share-research" // Example route
    }
  ];

   const PostOption = ({ option }) => (
    <Link to={option.link} className="no-underline">
    <div className="flex items-start space-x-4 p-4 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
      <div className={`${option.color} p-3 rounded-full text-white`}>
        {option.icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{option.title}</h3>
        <p className="text-gray-600 text-sm">{option.description}</p>
        {option.limit && (
          <span className="text-xs text-gray-500 mt-1 block">{option.limit}</span>
        )}
      </div>
    </div>
    </Link>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Create Content</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {basicOptions.map((option, i) => (
            <PostOption key={i} option={option} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Advanced Options</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {advancedOptions.map((option, i) => (
            <PostOption key={i} option={option} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostOptions;
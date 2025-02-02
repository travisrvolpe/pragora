import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Image,
  BookOpen,
  Brain,
  Users,
  ChartBar,
  Star,
  Calendar,
  Video,
  GraduationCap,
  Scale,
  Users2,
  Target,
  GitBranch,
} from 'lucide-react';
import "../../styles/pages/CreateContent.css";

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
      icon: <Video className="w-8 h-8" />,
      title: "Record Video",
      description: "Share video content",
      limit: "Up to 10 minutes",
      color: "bg-red-500",
      link: "/record-video"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Write Article",
      description: "In-depth analysis and post",
      limit: "No length limit",
      color: "bg-purple-500",
      link: "/write-article"
    }
  ];

  const debateOptions = [
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Oxford-style Debate",
      description: "Traditional formal debate format",
      color: "bg-orange-500",
      link: "/debate/oxford"
    },
    {
      icon: <Users2 className="w-8 h-8" />,
      title: "Modified Lincoln-Douglas",
      description: "One-on-one focused debate",
      color: "bg-yellow-600",
      link: "/debate/lincoln-douglas"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Pragma-dialectical",
      description: "Resolution-focused discussion",
      color: "bg-emerald-600",
      link: "/debate/pragma-dialectical"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Dialectical Inquiry",
      description: "Thesis-antithesis-synthesis approach",
      color: "bg-cyan-600",
      link: "/debate/dialectical"
    }
  ];

  const collaborativeOptions = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Project",
      description: "Collaborative initiatives",
      color: "bg-red-500",
      link: "/group-project"
    },
    {
      icon: <ChartBar className="w-8 h-8" />,
      title: "Share Research",
      description: "Data-driven insights",
      color: "bg-indigo-500",
      link: "/share-research"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Peer Review",
      description: "Academic discussion format",
      color: "bg-violet-500",
      link: "/peer-review"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Schedule Event",
      description: "Create and share events",
      color: "bg-rose-500",
      link: "/schedule-event"
    }
  ];

  const otherOptions = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Journaling",
      description: "Personal reflections and progress tracking",
      color: "bg-teal-500",
      path: "/TAP/journal"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Vision Board",
      description: "Visualize and plan your goals",
      color: "bg-indigo-500",
      path: "/TAP/vision-board"
    }
  ];

  const PostOption = ({ option }) => (
    <Link to={option.link || option.path} className="no-underline">
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
        <h2 className="text-2xl font-bold mb-4">Debate Formats</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {debateOptions.map((option, i) => (
            <PostOption key={i} option={option} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Collaborative Options</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {collaborativeOptions.map((option, i) => (
            <PostOption key={i} option={option} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Other Options</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {otherOptions.map((option, i) => (
            <PostOption key={i} option={option} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostOptions;
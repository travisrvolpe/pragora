// app/dialectica/create/page.tsx
'use client'

import React from 'react';
import Link from 'next/link';
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
import type { ContentOption, ContentSection } from '@/types/posts/create-content-types';

const CreateContent = () => {
  const basicOptions: ContentOption[] = [
    {
      icon: MessageCircle,
      title: "Share Thoughts",
      description: "Quick insights and updates",
      limit: "280 characters",
      color: "bg-blue-500",
      link: "/dialectica/create/thoughts"
    },
    {
      icon: Image,
      title: "Share Images",
      description: "Visual content with captions",
      limit: "Up to 4 images",
      color: "bg-green-500",
      link: "/test"
    },
    {
      icon: Video,
      title: "Record Video",
      description: "Share video content",
      limit: "Up to 10 minutes",
      color: "bg-red-500",
      link: "/dialectica/create/videos"
    },
    {
      icon: BookOpen,
      title: "Write Article",
      description: "In-depth analysis and post",
      limit: "No length limit",
      color: "bg-purple-500",
      link: "/dialectica/create/articles"
    }
  ];

  const debateOptions: ContentOption[] = [
    {
      icon: Scale,
      title: "Oxford-style Debate",
      description: "Traditional formal debate format",
      color: "bg-orange-500",
      link: "/dialectica/create/debates/oxford"
    },
    {
      icon: Users2,
      title: "Modified Lincoln-Douglas",
      description: "One-on-one focused debate",
      color: "bg-yellow-600",
      link: "/dialectica/create/debates/lincoln-douglas"
    },
    {
      icon: Target,
      title: "Pragma-dialectical",
      description: "Resolution-focused discussion",
      color: "bg-emerald-600",
      link: "/dialectica/create/debates/pragma"
    },
    {
      icon: GitBranch,
      title: "Dialectical Inquiry",
      description: "Thesis-antithesis-synthesis approach",
      color: "bg-cyan-600",
      link: "/dialectica/create/debates/inquiry"
    }
  ];

  const collaborativeOptions: ContentOption[] = [
    {
      icon: Users,
      title: "Group Project",
      description: "Collaborative initiatives",
      color: "bg-red-500",
      link: "/dialectica/create/collaborative/project"
    },
    {
      icon: ChartBar,
      title: "Share Research",
      description: "Data-driven insights",
      color: "bg-indigo-500",
      link: "/dialectica/create/collaborative/research"
    },
    {
      icon: GraduationCap,
      title: "Peer Review",
      description: "Academic discussion format",
      color: "bg-violet-500",
      link: "/dialectica/create/collaborative/review"
    },
    {
      icon: Calendar,
      title: "Schedule Event",
      description: "Create and share events",
      color: "bg-rose-500",
      link: "/dialectica/create/collaborative/event"
    }
  ];

  const otherOptions: ContentOption[] = [
    {
      icon: BookOpen,
      title: "Journaling",
      description: "Personal reflections and progress tracking",
      color: "bg-teal-500",
      link: "/tap/journal"
    },
    {
      icon: Star,
      title: "Vision Board",
      description: "Visualize and plan your goals",
      color: "bg-indigo-500",
      link: "/tap/vision-board"
    }
  ];

  const sections: ContentSection[] = [
    { title: "Create Content", options: basicOptions },
    { title: "Debate Formats", options: debateOptions },
    { title: "Collaborative Options", options: collaborativeOptions },
    { title: "Other Options", options: otherOptions }
  ];

  const ContentOption = ({ option }: { option: ContentOption }) => {
    const Icon = option.icon;

    return (
      <Link href={option.link} className="no-underline">
        <div className="flex items-start space-x-4 p-4 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
          <div className={`${option.color} p-3 rounded-full text-white`}>
            <Icon className="w-8 h-8" />
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
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {section.options.map((option, i) => (
              <ContentOption key={i} option={option} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateContent;
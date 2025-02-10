// src/components/home/FeatureCard.tsx
'use client'

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple'
  href: string
  label: string
}

export default function FeatureCard({ title, description, icon: Icon, color, href, label }: FeatureCardProps) {
  const colorClasses = {
    blue: {
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    green: {
      icon: 'text-green-500',
      button: 'bg-green-500 hover:bg-green-600',
    },
    purple: {
      icon: 'text-purple-500',
      button: 'bg-purple-500 hover:bg-purple-600',
    },
  }[color]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <Icon className={`${colorClasses.icon} mr-2`} size={24} />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        href={href}
        className={`block w-full px-4 py-2 text-white rounded transition-colors text-center ${colorClasses.button}`}
      >
        {title === 'Dialectica' ? 'Explore Discussions' :
         title === 'TAP' ? 'Start Planning' : 'Join Network'}
      </Link>
    </div>
  )
}
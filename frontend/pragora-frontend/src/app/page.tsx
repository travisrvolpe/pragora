// src/app/page.tsx
'use client'

import * as React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Brain, Target, Users } from 'lucide-react'

// Dynamically import client components
const FeatureCard = dynamic(() => import('@/components/home/FeatureCard'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
})

const AuthButtons = dynamic(() => import('@/components/home/AuthButtons').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="animate-pulse h-12 w-64 bg-gray-200 rounded-md mx-auto"></div>
})

export default function HomePage() {
  console.log('HomePage rendering')

  return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-40 h-40 mx-auto mb-6 relative">
              <Image
                  src="/images/ZERO_CROP.PNG"
                  alt="Pragora Logo"
                  fill
                  className="object-contain"
                  priority
              />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Pragora</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform knowledge into action through evidence-based discussion,
              personalized planning, and community-driven support.
            </p>
          </div>


        {/* Authentication Section */}
        <AuthButtons />

        {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <FeatureCard
                title="Dialectica"
                description="Engage in high-quality discussions where AI-validated content and collaborative moderation ensure logical, evidence-based dialogue focused on practical solutions."
                icon={Brain}
                color="blue"
                href="/dialectica"
                label="Evidence-based Discussion"
            />

            <FeatureCard
                title="TAP"
                description="Transform insights into personalized action plans that adapt to your goals, resources, and progress. Get step-by-step guidance for achieving measurable outcomes."
                icon={Target}
                color="green"
                href="/tap"
                label="Tactical Action Planning"
            />

            <FeatureCard
                title="PAN"
                description="Connect with mentors, experts, and peers who share your goals. Access resources, form accountability groups, and collaborate on shared initiatives."
                icon={Users}
                color="purple"
                href="/pan"
                label="Pragmatic Action Network"
            />
          </div>
        </div>
      </div>
  )
}
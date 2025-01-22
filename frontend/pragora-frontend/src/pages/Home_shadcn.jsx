import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn, Brain, Target, Users } from 'lucide-react';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Hero Section with Quick Auth */}
      <div className="max-w-6xl mx-auto mb-12">
        {/* Logo and Welcome */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-6">
            <img
              src="/api/placeholder/96/96"
              alt="Pragora Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Pragora</h1>
          <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
            Transform knowledge into action through evidence-based discussions,
            personalized planning, and community-driven support.
          </p>
        </div>

        {/* Auth Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 min-w-[200px] text-lg py-6"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Register Now
          </Button>

          <span className="text-gray-500">or</span>

          <Card className="w-80">
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="outline" className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Components */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dialectica Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-600" />
              Dialectica
            </CardTitle>
            <CardDescription>Evidence-based discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Engage in high-quality discussions where AI-validated content and collaborative
              moderation ensure logical, evidence-based dialogue focused on practical solutions.
            </p>
            <Button variant="outline" className="w-full">
              Explore Discussions
            </Button>
          </CardContent>
        </Card>

        {/* TAP Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-green-600" />
              TAP
            </CardTitle>
            <CardDescription>Tactical Action Planning</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Transform insights into personalized action plans that adapt to your goals,
              resources, and progress. Get step-by-step guidance for achieving measurable outcomes.
            </p>
            <Button variant="outline" className="w-full">
              View Demo
            </Button>
          </CardContent>
        </Card>

        {/* PAN Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-600" />
              PAN
            </CardTitle>
            <CardDescription>Pragmatic Action Network</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect with mentors, experts, and peers who share your goals. Access resources,
              form accountability groups, and collaborate on shared initiatives.
            </p>
            <Button variant="outline" className="w-full">
              View Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
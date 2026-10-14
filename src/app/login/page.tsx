'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, ShieldCheck, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('candidate@example.com');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 400);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            JobPilot <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-100">Sign in to your account</h2>
        <p className="text-xs text-slate-400">
          Access your verified master profile, application pipeline, and AI tailoring tools.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
          <CardContent className="p-6 space-y-5">
            {/* Quick Demo Access Button */}
            <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Instant Guest & Demo Access
                </span>
                <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  Zero Setup
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore the platform with realistic pre-configured candidate profiles and public jobs.
              </p>
              <Button variant="primary" size="sm" className="w-full text-xs" onClick={handleDemoLogin}>
                Enter Demo Workspace &rarr;
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-xs text-slate-500 absolute">or sign in with email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <Button variant="outline" size="sm" type="submit" isLoading={isLoading} className="w-full">
                Sign In
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-400 hover:underline font-medium">
                Create one now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

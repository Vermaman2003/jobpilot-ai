'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, ShieldCheck, ArrowRight, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [integrityPledgeAccepted, setIntegrityPledgeAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!integrityPledgeAccepted) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push('/onboarding');
    }, 400);
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
        <h2 className="text-2xl font-bold text-slate-100">Create your account</h2>
        <p className="text-xs text-slate-400">
          Join the candidate integrity movement. Apply truthfully, tailor cleanly, land faster.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jane.doe@example.com"
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
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Candidate Integrity Pledge */}
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/50 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="integrity-pledge"
                    checked={integrityPledgeAccepted}
                    onChange={(e) => setIntegrityPledgeAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="integrity-pledge" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                      Candidate Integrity Pledge:
                    </span>{' '}
                    I pledge that my master resume represents genuine, verifiable achievements. I agree never to inject ungrounded metrics or false skills into applications.
                  </label>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isLoading}
                disabled={!integrityPledgeAccepted}
                className="w-full"
              >
                Create Account & Ingest Resume &rarr;
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

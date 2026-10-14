import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Compass,
  FileText,
  Inbox,
  Clock,
  Lock,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-850 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              JobPilot <span className="text-indigo-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/app/dashboard">
              <Button variant="primary" size="sm">
                Open App
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-slate-800">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            The Truthful AI Job Search & Application Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Supercharge your job search{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              without fabricating a single claim.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            JobPilot AI manages your full job search lifecycle: authorized public job discovery, explainable 0–100 match
            scoring, strict claim-provenance resume tailoring, and email response tracking.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3">
                Launch Workspace
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 py-3">
                Guided Onboarding Wizard
              </Button>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Immutable Master
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your original resume is the unalterable source of truth.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Claim Provenance
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Every tailored bullet is verified against master facts.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Permitted Discovery
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Live Greenhouse & Lever public APIs, plus CSV import.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Zero Mandatory Cost
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                100% free tier deployable with deterministic offline fallback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="md">
            Architected for Engineers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
            An end-to-end platform built with integrity at the core.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Say goodbye to spammy AI cover letter generators that hallucinate fake skills and fabricate metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Truthful Resume Tailoring</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Highlights your real, existing skills using active verbs. Every single proposed bullet is cross-checked
                against your master resume. Unsupported claims and missing skills are flagged transparently as skill
                gaps.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-medium text-indigo-400 flex items-center gap-1">
              Exports real DOCX & selectable text ATS PDFs
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Explainable Job Discovery</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Queries public job board endpoints from top tech companies (Stripe, Figma, Benchling, GitLab). Calculates
                a normalized 0–100 match score with exact skill alignment and experience gap explanations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-medium text-emerald-400 flex items-center gap-1">
              Separate calculations for internship vs full-time
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-700/60 flex items-center justify-center text-sky-400 mb-4">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Response Intelligence & Inbox</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Integrates with Gmail API using read-only scopes. Detects application confirmations, recruiter replies,
                interview screens, and formal offer letters with evidence snippets and confidence scoring.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-medium text-sky-400 flex items-center gap-1">
              Includes mock inbox for offline demonstration
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">JobPilot AI</span>
            <span className="text-xs text-slate-500">• Production Open Source Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/app/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/app/jobs" className="hover:text-white">
              Discovery
            </Link>
            <Link href="/app/applications" className="hover:text-white">
              Applications
            </Link>
            <Link href="/app/profile" className="hover:text-white">
              Master Resume
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

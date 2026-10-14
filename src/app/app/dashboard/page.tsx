'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Briefcase,
  FileCheck,
  Award,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Inbox,
  AlertCircle,
  Play,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { JobCard } from '@/components/jobs/JobCard';

export default function DashboardPage() {
  const {
    stats,
    applications,
    jobs,
    scheduledConfig,
    scheduledRuns,
    triggerManualSearchRun,
    masterResume,
    isMounted,
  } = useApp();

  const [isRunningSearch, setIsRunningSearch] = React.useState(false);

  const handleRunSearchNow = async () => {
    setIsRunningSearch(true);
    try {
      await triggerManualSearchRun();
    } finally {
      setIsRunningSearch(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading JobPilot dashboard data...
      </div>
    );
  }

  // Recommended top jobs with high score
  const topJobs = [...jobs].slice(0, 3);

  // Recent activities across all applications
  const allActivities = applications
    .flatMap((a) =>
      a.activities.map((act) => ({
        ...act,
        company: a.job.company,
        jobTitle: a.job.title,
        appId: a.id,
      }))
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const lastRun = scheduledRuns[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Welcome back, {masterResume.contact.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your end-to-end job search pipeline with verified candidate integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/jobs">
            <Button variant="outline" size="sm" icon={<Compass className="w-4 h-4 text-indigo-400" />}>
              Discover Jobs
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunSearchNow}
            isLoading={isRunningSearch}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Run Scheduled Search
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Discovered */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Jobs Discovered</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">{stats.totalDiscovered}</div>
            <span className="text-[11px] text-indigo-400 mt-0.5 inline-block">From permitted sources</span>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Shortlisted</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">{stats.totalShortlisted}</div>
            <span className="text-[11px] text-sky-400 mt-0.5 inline-block">Active review</span>
          </div>
        </div>

        {/* Applied */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Submitted Applications</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">{stats.totalApplied}</div>
            <span className="text-[11px] text-amber-400 mt-0.5 inline-block">
              {stats.responseRate}% response rate
            </span>
          </div>
        </div>

        {/* Interviews & Offers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Interviews & Offers</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400">
              {stats.totalInterviews} <span className="text-sm font-normal text-slate-400">/ {stats.totalOffers} offers</span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-0.5 inline-block">
              {stats.upcomingFollowUpsCount} follow-ups scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Application Funnel Chart (Visual breakdown) */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Application Lifecycle Funnel</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Live progression of your active candidates from discovery to final outcome
            </p>
          </div>
          <Link href="/app/applications" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View Full Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Discovered', count: stats.totalDiscovered, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
              { label: 'Shortlisted', count: stats.totalShortlisted, color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
              {
                label: 'Tailored',
                count: applications.filter((a) => a.tailoredResumeId || a.status === 'TAILORING' || a.status === 'READY_TO_APPLY').length,
                color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
              },
              { label: 'Applied', count: stats.totalApplied, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
              { label: 'Interviewing', count: stats.totalInterviews, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
              { label: 'Offers', count: stats.totalOffers, color: 'bg-green-500/20 text-green-300 border-green-500/30' },
            ].map((step, idx) => (
              <div
                key={step.label}
                className={`p-3 rounded-xl border ${step.color} flex flex-col justify-between`}
              >
                <div className="text-[11px] font-semibold text-slate-400">{step.label}</div>
                <div className="text-2xl font-bold text-slate-100 mt-2">{step.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Grid: Scheduled Searches & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scheduled Automation Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Scheduled Job Search</CardTitle>
              <Badge variant={scheduledConfig.isEnabled ? 'success' : 'neutral'} size="sm">
                {scheduledConfig.isEnabled ? 'Active Daily' : 'Disabled'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Scheduled Time</span>
              <span className="font-semibold text-slate-200">
                {scheduledConfig.timeOfDay} ({scheduledConfig.timeZone.split('/')[1] || 'Local'})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Target Roles</span>
              <span className="font-semibold text-slate-200 text-right line-clamp-1">
                {scheduledConfig.targetTitles.slice(0, 2).join(', ')}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Last Execution</span>
              <span className="font-semibold text-slate-200">
                {lastRun ? new Date(lastRun.executedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>

            {lastRun && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Discovered: <strong className="text-slate-200">{lastRun.jobsDiscovered}</strong></span>
                  <span>New: <strong className="text-emerald-400">+{lastRun.newJobsStored}</strong></span>
                  <span>High Match: <strong className="text-indigo-400">{lastRun.highMatchJobsFound}</strong></span>
                </div>
              </div>
            )}

            <Link href="/app/automation" className="block pt-1">
              <Button size="sm" variant="outline" className="w-full text-xs">
                Configure Automation Rules
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Right: Recent Pipeline Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm">Recent Application Activity</CardTitle>
            <Link href="/app/applications" className="text-xs text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {allActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No activity logged yet. Shortlist a job to begin tracking!
              </div>
            ) : (
              <div className="space-y-3">
                {allActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200">{act.description}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {act.jobTitle} at <span className="text-indigo-400 font-semibold">{act.company}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Jobs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Recommended High-Match Opportunities
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked using transparent, explainable skill and experience scoring
            </p>
          </div>
          <Link href="/app/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            Browse All ({jobs.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}

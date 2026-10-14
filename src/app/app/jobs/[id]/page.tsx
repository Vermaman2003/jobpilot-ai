'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  Award,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { RelevanceScorer } from '@/lib/scoring/relevance-scorer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { jobs, masterResume, preferences, createApplication, checkDuplicateDetails } = useApp();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const jobId = params.id as string;
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-200">Job Not Found</h2>
        <p className="text-xs text-slate-400">The requested job listing could not be found.</p>
        <Link href="/app/jobs">
          <Button size="sm" variant="outline">
            Back to Job Discovery
          </Button>
        </Link>
      </div>
    );
  }

  const match = RelevanceScorer.calculateMatch(masterResume, preferences, job);
  const dupInfo = checkDuplicateDetails(job);
  const existingApp = dupInfo.exactMatch;
  const existingCompanyApp = dupInfo.sameCompanyMatch;
  const existingUrlApp = dupInfo.sameUrlMatch;

  const handleShortlistClick = () => {
    if (existingCompanyApp || existingUrlApp) {
      setShowDuplicateModal(true);
    } else {
      executeShortlist();
    }
  };

  const executeShortlist = () => {
    const app = createApplication(job.id);
    router.push(`/app/applications/${app.id}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button and navigation */}
      <div>
        <Link
          href="/app/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </Link>
      </div>

      {/* Main Job Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {job.company}
            </span>
            <Badge variant="neutral" size="sm">
              Source: {job.source}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">{job.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {job.location}
            </span>
            <span>•</span>
            <Badge variant="outline" size="sm">
              {job.workArrangement}
            </Badge>
            <Badge variant="neutral" size="sm">
              {job.employmentType.replace('_', ' ')}
            </Badge>
            {job.salaryMin && (
              <span className="text-emerald-400 font-semibold">
                ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.salaryCurrency}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          {existingApp ? (
            <Link href={`/app/applications/${existingApp.id}`} className="w-full md:w-auto">
              <Button size="md" variant="primary" className="w-full">
                <FileCheck className="w-4 h-4 mr-2" />
                Open Application Workspace
              </Button>
            </Link>
          ) : (
            <Button size="md" variant="primary" onClick={handleShortlistClick} className="w-full md:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              Shortlist & Tailor Resume
            </Button>
          )}

          <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
            <Button size="md" variant="outline" title="Open official job posting">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* Active Pipeline Warning Banner if candidate already applied to this company */}
      {existingCompanyApp && !existingApp && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-200">
                Active Application Pipeline at {job.company}
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                You already have an active application for{' '}
                <strong className="text-white">{existingCompanyApp.job.title}</strong> in stage{' '}
                <span className="text-amber-300 font-semibold">{existingCompanyApp.status.replace(/_/g, ' ')}</span>.
                Review company policy regarding multiple concurrent submissions before applying.
              </p>
            </div>
          </div>
          <Link href={`/app/applications/${existingCompanyApp.id}`} className="shrink-0">
            <Button size="sm" variant="outline" className="border-amber-700/60 text-amber-200 hover:bg-amber-900/40">
              View Active Application
            </Button>
          </Link>
        </div>
      )}

      {/* Critical Gap Warning if present */}
      {match.criticalGaps.length > 0 && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-200">Critical Eligibility Gap Detected</div>
            <div className="mt-1 space-y-1">
              {match.criticalGaps.map((gap, i) => (
                <div key={i}>• {gap}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Match Explanation & Full Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Explainable Match Analysis */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Explainable Match Breakdown</CardTitle>
                <Badge
                  variant={
                    match.score >= 80 ? 'success' : match.score >= 65 ? 'primary' : 'warning'
                  }
                  size="md"
                  className="font-bold text-sm"
                >
                  {match.score}/100
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Deterministic calculation. Never represents a probability of hiring.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Factor 1: Skills Alignment */}
              <div>
                <div className="flex items-center justify-between font-medium text-slate-300 mb-1">
                  <span>Required Skills Alignment</span>
                  <span className="text-indigo-400 font-bold">{match.skillAlignmentScore}/40</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${(match.skillAlignmentScore / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 2: Experience Duration */}
              <div>
                <div className="flex items-center justify-between font-medium text-slate-300 mb-1">
                  <span>Experience Duration</span>
                  <span className="text-sky-400 font-bold">{match.experienceAlignmentScore}/25</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${(match.experienceAlignmentScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 3: Title & Target Role */}
              <div>
                <div className="flex items-center justify-between font-medium text-slate-300 mb-1">
                  <span>Title & Role Alignment</span>
                  <span className="text-purple-400 font-bold">{match.titleAlignmentScore}/20</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${(match.titleAlignmentScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 4: Preferences & Arrangement */}
              <div>
                <div className="flex items-center justify-between font-medium text-slate-300 mb-1">
                  <span>Location & Preferences</span>
                  <span className="text-emerald-400 font-bold">{match.preferenceAlignmentScore}/15</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(match.preferenceAlignmentScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Matching Skills */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                  Matching Candidate Skills ({match.matchingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {match.matchingSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 rounded text-[11px] flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {match.missingRequiredSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-2">
                    Missing Requirements ({match.missingRequiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {match.missingRequiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-amber-950/30 text-amber-300/90 border border-amber-800/30 rounded text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Full Job Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Official Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                {job.description}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Duplicate / Multiple Applications Confirmation Modal */}
      <Modal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Multiple Applications Warning"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-200">Active Pipeline at {job.company}</div>
              <p className="mt-1 text-slate-300 leading-relaxed">
                You already have an active application in your pipeline for{' '}
                <strong className="text-white">{(existingCompanyApp || existingUrlApp)?.job.title}</strong> (Stage:{' '}
                <span className="text-amber-300 font-semibold">
                  {(existingCompanyApp || existingUrlApp)?.status.replace(/_/g, ' ')}
                </span>
                ).
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Many employers enforce restrictions or cooling-off periods for multiple concurrent submissions. Are you sure you want to shortlist this additional position at {job.company}?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowDuplicateModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setShowDuplicateModal(false);
                executeShortlist();
              }}
            >
              Shortlist Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

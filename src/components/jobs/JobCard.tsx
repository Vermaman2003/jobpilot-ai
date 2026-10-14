'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { JobPosting } from '@/types';
import { useApp } from '@/context/app-context';
import { RelevanceScorer } from '@/lib/scoring/relevance-scorer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface JobCardProps {
  job: JobPosting;
  onOpenDetails?: (job: JobPosting) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onOpenDetails }) => {
  const { masterResume, preferences, createApplication, checkDuplicateDetails } = useApp();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const match = React.useMemo(() => {
    return RelevanceScorer.calculateMatch(masterResume, preferences, job);
  }, [masterResume, preferences, job]);

  const dupInfo = checkDuplicateDetails(job);
  const existingApp = dupInfo.exactMatch;
  const existingCompanyApp = dupInfo.sameCompanyMatch;

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 65) return 'primary';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 transition-all shadow-sm flex flex-col justify-between group">
      <div>
        {/* Header & Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {job.company}
              </span>
              {existingCompanyApp && !existingApp && (
                <span
                  className="text-[10px] text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"
                  title={`Active application at ${job.company}: ${existingCompanyApp.job.title} (${existingCompanyApp.status})`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  Active App at {job.company}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mt-0.5">
              {job.title}
            </h3>
          </div>

          <div className="flex flex-col items-end">
            <Badge variant={getScoreVariant(match.score)} size="md" className="font-bold">
              {match.score}% Match
            </Badge>
            <span className="text-[10px] text-slate-400 mt-1">Explainable</span>
          </div>
        </div>

        {/* Location & Meta Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span>•</span>
          <Badge variant="outline" size="sm">
            {job.workArrangement}
          </Badge>
          <Badge variant="neutral" size="sm">
            {job.employmentType.replace('_', ' ')}
          </Badge>
          <Badge variant="neutral" size="sm">
            {job.source}
          </Badge>
        </div>

        {/* Critical Gap Banner if present */}
        {match.criticalGaps.length > 0 && (
          <div className="mt-3 p-2 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{match.criticalGaps[0]}</span>
          </div>
        )}

        {/* Skills Alignment Summary */}
        <div className="mt-3.5">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Demonstrated Skills</span>
            <span className="text-emerald-400 font-semibold">{match.matchingSkills.length} matched</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {match.matchingSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 bg-slate-800/80 text-emerald-300 border border-emerald-800/40 rounded-md flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {skill}
              </span>
            ))}
            {match.missingRequiredSkills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 bg-slate-800/40 text-amber-300/80 border border-amber-800/30 rounded-md"
                title="Missing Requirement"
              >
                Needs: {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          href={`/app/jobs/${job.id}`}
          className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
        >
          View Full Breakdown
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </Link>

        {existingApp ? (
          <Link href={`/app/applications/${existingApp.id}`}>
            <Button size="sm" variant="outline" className="text-xs">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              In Pipeline ({existingApp.status.replace(/_/g, ' ')})
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="primary"
            className="text-xs"
            onClick={() => {
              if (existingCompanyApp) {
                setShowDuplicateModal(true);
              } else {
                createApplication(job.id);
              }
            }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Shortlist Role
          </Button>
        )}
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
                <strong className="text-white">{existingCompanyApp?.job.title}</strong> (Stage:{' '}
                <span className="text-amber-300 font-semibold">{existingCompanyApp?.status.replace(/_/g, ' ')}</span>).
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Many employers enforce limits or cooling-off periods for multiple concurrent submissions. Are you sure you want to shortlist this additional position at {job.company}?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowDuplicateModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                createApplication(job.id);
                setShowDuplicateModal(false);
              }}
            >
              Shortlist Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

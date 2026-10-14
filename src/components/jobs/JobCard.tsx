'use client';

import React from 'react';
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

export interface JobCardProps {
  job: JobPosting;
  onOpenDetails?: (job: JobPosting) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onOpenDetails }) => {
  const { masterResume, preferences, createApplication, checkDuplicateApplication } = useApp();

  const match = React.useMemo(() => {
    return RelevanceScorer.calculateMatch(masterResume, preferences, job);
  }, [masterResume, preferences, job]);

  const existingApp = checkDuplicateApplication(job.id);

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
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {job.company}
            </span>
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
              In Pipeline ({existingApp.status.replace('_', ' ')})
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="primary"
            className="text-xs"
            onClick={() => {
              createApplication(job.id);
            }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Shortlist Role
          </Button>
        )}
      </div>
    </div>
  );
};

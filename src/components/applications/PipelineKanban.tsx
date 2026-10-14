'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ChevronRight,
  Clock,
  ExternalLink,
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';
import { useApp } from '@/context/app-context';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface KanbanColumn {
  id: string;
  title: string;
  statuses: ApplicationStatus[];
  color: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'col_shortlisted',
    title: 'Shortlisted & Saved',
    statuses: ['DISCOVERED', 'SHORTLISTED', 'SAVED'],
    color: 'border-slate-700',
  },
  {
    id: 'col_tailoring',
    title: 'Tailoring & Review',
    statuses: ['TAILORING'],
    color: 'border-indigo-800/80',
  },
  {
    id: 'col_ready',
    title: 'Ready to Apply',
    statuses: ['READY_TO_APPLY'],
    color: 'border-blue-800/80',
  },
  {
    id: 'col_applied',
    title: 'Applied & Confirmed',
    statuses: ['APPLIED', 'CONFIRMATION_RECEIVED', 'RECRUITER_CONTACT'],
    color: 'border-amber-800/80',
  },
  {
    id: 'col_interview',
    title: 'Interview Stage',
    statuses: ['INTERVIEW'],
    color: 'border-emerald-800/80',
  },
  {
    id: 'col_decision',
    title: 'Outcome (Offer / Closed)',
    statuses: ['OFFER', 'REJECTED', 'WITHDRAWN', 'CLOSED', 'NOT_A_FIT'],
    color: 'border-slate-800',
  },
];

export const PipelineKanban: React.FC = () => {
  const { applications, updateApplicationStatus } = useApp();
  const [filterText, setFilterText] = React.useState('');

  const filteredApps = React.useMemo(() => {
    if (!filterText.trim()) return applications;
    const q = filterText.toLowerCase();
    return applications.filter(
      (a) =>
        a.job.company.toLowerCase().includes(q) ||
        a.job.title.toLowerCase().includes(q) ||
        a.job.location.toLowerCase().includes(q)
    );
  }, [applications, filterText]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Filter by company or role..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Total in Pipeline: <strong className="text-slate-100">{applications.length}</strong>
          </span>
          <span>•</span>
          <span>
            Active Interviews:{' '}
            <strong className="text-emerald-400">
              {applications.filter((a) => a.status === 'INTERVIEW').length}
            </strong>
          </span>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colApps = filteredApps.filter((a) => col.statuses.includes(a.status));

          return (
            <div
              key={col.id}
              className={`bg-slate-950/60 border ${col.color} rounded-xl p-3 flex flex-col min-w-[240px] max-h-[calc(100vh-250px)]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-xs font-semibold text-slate-200">{col.title}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
                  {colApps.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
                {colApps.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
                    No applications
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3 transition-colors shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider line-clamp-1">
                            {app.job.company}
                          </span>
                          <Badge
                            variant={
                              app.matchScore.score >= 80
                                ? 'success'
                                : app.matchScore.score >= 65
                                ? 'primary'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {app.matchScore.score}%
                          </Badge>
                        </div>

                        <Link
                          href={`/app/applications/${app.id}`}
                          className="text-xs font-semibold text-slate-200 hover:text-indigo-300 transition-colors line-clamp-2 mt-1"
                        >
                          {app.job.title}
                        </Link>

                        <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                          <span>{app.job.location}</span>
                          <span>{app.job.workArrangement}</span>
                        </div>

                        {app.followUpDate && (
                          <div className="mt-2 text-[10px] px-2 py-1 bg-amber-950/40 text-amber-300 border border-amber-800/40 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Follow up: {app.followUpDate}
                          </div>
                        )}
                      </div>

                      {/* Card Action footer */}
                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <Link
                          href={`/app/applications/${app.id}`}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                        >
                          Workspace
                          <ChevronRight className="w-3 h-3" />
                        </Link>

                        {/* Quick stage toggle menu */}
                        <select
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                          className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                        >
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="TAILORING">Tailoring</option>
                          <option value="READY_TO_APPLY">Ready to Apply</option>
                          <option value="APPLIED">Applied</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="OFFER">Offer</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

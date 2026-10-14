'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Columns,
  List,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { ApplicationStatus } from '@/types';
import { PipelineKanban } from '@/components/applications/PipelineKanban';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ApplicationsPage() {
  const { applications, updateApplicationStatus } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredApps = React.useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          app.job.company.toLowerCase().includes(q) ||
          app.job.title.toLowerCase().includes(q) ||
          app.job.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Application Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track candidates across every stage of the hiring lifecycle with assisted submission workflows.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Table View
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {viewMode === 'kanban' ? (
        <PipelineKanban />
      ) : (
        <div className="space-y-4">
          {/* Table Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search company or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Lifecycle Stages</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="TAILORING">Tailoring</option>
                <option value="READY_TO_APPLY">Ready to Apply</option>
                <option value="APPLIED">Applied</option>
                <option value="CONFIRMATION_RECEIVED">Confirmed</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Tabular List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Company & Role</th>
                  <th className="p-4">Match Score</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Follow-Up</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No applications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-slate-100 block">{app.job.title}</span>
                        <span className="text-slate-400 text-[11px]">{app.job.company} • {app.job.location}</span>
                      </td>
                      <td className="p-4">
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
                      </td>
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none"
                        >
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="TAILORING">Tailoring</option>
                          <option value="READY_TO_APPLY">Ready to Apply</option>
                          <option value="APPLIED">Applied</option>
                          <option value="CONFIRMATION_RECEIVED">Confirmed</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="OFFER">Offer</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {app.followUpDate ? (
                          <span className="inline-flex items-center gap-1 text-amber-300">
                            <Clock className="w-3 h-3" />
                            {app.followUpDate}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/app/applications/${app.id}`}>
                          <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                            Workspace <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Filter,
  RefreshCw,
  Upload,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { JobPosting, WorkArrangement, JobSourceType } from '@/types';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function JobsPage() {
  const { jobs, refreshPublicJobs, importCsvJobs, preferences } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArrangement, setSelectedArrangement] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{ count: number; errors: string[] } | null>(null);

  // CSV Import Modal State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvImportCount, setCsvImportCount] = useState<number | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await refreshPublicJobs(searchQuery);
      setRefreshResult({ count: res.addedCount, errors: res.errors });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCsvImport = () => {
    setCsvError(null);
    setCsvImportCount(null);
    try {
      const count = importCsvJobs(csvText);
      setCsvImportCount(count);
      setCsvText('');
    } catch (err: any) {
      setCsvError(err.message || 'Failed to parse CSV');
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.requiredSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Work arrangement
      if (selectedArrangement !== 'ALL' && job.workArrangement !== selectedArrangement) {
        return false;
      }

      // Source
      if (selectedSource !== 'ALL' && job.source !== selectedSource) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedArrangement, selectedSource]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Job Discovery Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated from permitted public Greenhouse & Lever boards, plus custom career feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCsvModalOpen(true)}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
          >
            Import CSV
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Boards
          </Button>
        </div>
      </div>

      {/* Refresh Status Banner if present */}
      {refreshResult && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
          <span>
            {refreshResult.count > 0
              ? `Successfully synchronized ${refreshResult.count} new jobs from public endpoints.`
              : 'Public boards checked. All listings are up-to-date.'}
          </span>
          <button
            onClick={() => setRefreshResult(null)}
            className="text-[11px] underline text-indigo-400 hover:text-indigo-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, company, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Work Arrangement */}
          <div>
            <select
              value={selectedArrangement}
              onChange={(e) => setSelectedArrangement(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Work Arrangements</option>
              <option value="REMOTE">Remote Only</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Job Sources</option>
              <option value="GREENHOUSE">Greenhouse Boards</option>
              <option value="LEVER">Lever Postings</option>
              <option value="CSV_IMPORT">CSV Imports</option>
            </select>
          </div>

          {/* Result Count and Clear Filters */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-100">{filteredJobs.length}</strong> jobs
            </span>
            {(searchQuery || selectedArrangement !== 'ALL' || selectedSource !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedArrangement('ALL');
                  setSelectedSource('ALL');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No matching jobs found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, or click &quot;Refresh Boards&quot; to fetch the latest public opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* CSV Import Modal */}
      <Modal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        title="Import Jobs via CSV"
        description="Paste standard CSV text containing Title, Company, Location, and URL columns."
      >
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Example header format:{' '}
            <code className="px-1.5 py-0.5 bg-slate-950 text-indigo-300 rounded font-mono">
              Title, Company, Location, Skills, Url, Arrangement
            </code>
          </div>

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Title, Company, Location, Skills, Url, Arrangement\nFull-Stack Engineer, Acme Corp, Remote, "TypeScript, React, Node.js", https://acme.com/jobs/1, Remote\nBackend Engineer, CloudInc, San Francisco CA, "Go, Kubernetes, Docker", https://cloudinc.com/jobs/2, Hybrid`}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none"
          />

          {csvError && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-300">
              {csvError}
            </div>
          )}

          {csvImportCount !== null && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Successfully imported {csvImportCount} jobs into your discovery catalog!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCsvModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleCsvImport} disabled={!csvText.trim()}>
              Import Records
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Globe,
  Layers,
  Sparkles,
  ShieldAlert,
  Terminal,
  Settings2,
  Activity,
  History,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AutomationPage() {
  const { scheduledConfig, updateScheduledConfig, scheduledRuns, triggerManualSearchRun } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [lastRunSuccess, setLastRunSuccess] = useState<string | null>(null);

  // Form state
  const [isEnabled, setIsEnabled] = useState(scheduledConfig.isEnabled);
  const [frequency, setFrequency] = useState(scheduledConfig.frequency);
  const [timeOfDay, setTimeOfDay] = useState(scheduledConfig.timeOfDay);
  const [timeZone, setTimeZone] = useState(scheduledConfig.timeZone);
  const [minMatchScore, setMinMatchScore] = useState(scheduledConfig.minMatchScore);
  const [keywordsText, setKeywordsText] = useState(scheduledConfig.keywords.join(', '));
  const [targetTitlesText, setTargetTitlesText] = useState(scheduledConfig.targetTitles.join(', '));
  const [locationsText, setLocationsText] = useState(scheduledConfig.locations.join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateScheduledConfig({
      isEnabled,
      frequency,
      timeOfDay,
      timeZone,
      minMatchScore: Number(minMatchScore),
      keywords: keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      targetTitles: targetTitlesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      locations: locationsText
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    try {
      const run = await triggerManualSearchRun();
      setLastRunSuccess(
        `Discovered ${run.jobsDiscovered} jobs, saved ${run.newJobsStored} new jobs (${run.highMatchJobsFound} high-match) in ${run.durationMs}ms.`
      );
      setTimeout(() => setLastRunSuccess(null), 5000);
    } catch (err: any) {
      alert(`Manual search failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              Automated Job Discovery & Scheduler
            </h1>
            <Badge variant={isEnabled ? 'success' : 'neutral'} size="sm">
              {isEnabled ? 'Active Schedule' : 'Paused'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure automated daily background runs that poll permitted public job boards (Greenhouse, Lever),
            calculate match scores against your truthful profile, and alert you of relevant openings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" isLoading={isRunning} onClick={handleRunNow}>
            <Play className="w-4 h-4 mr-1.5" />
            Trigger Run Now
          </Button>
        </div>
      </div>

      {lastRunSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{lastRunSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-400" />
                    Schedule Settings
                  </CardTitle>
                  <CardDescription>
                    Automated runs operate within free-tier quotas and only send notifications for jobs meeting your score threshold.
                  </CardDescription>
                </div>
                {savedSuccess && (
                  <Badge variant="success" size="sm">
                    Saved Successfully
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveConfig} className="space-y-4">
                {/* Active switch */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-sm font-medium text-slate-200 block">Enable Automated Daily Search</span>
                    <span className="text-xs text-slate-400">
                      When enabled, queries public boards automatically according to the cadence below.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="DAILY">Once Daily</option>
                      <option value="HOURLY_12">Twice Daily (Every 12h)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Time of Day (UTC)</label>
                    <input
                      type="time"
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Timezone</label>
                    <input
                      type="text"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Target Role Titles (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={targetTitlesText}
                    onChange={(e) => setTargetTitlesText(e.target.value)}
                    placeholder="Software Engineer, Full Stack Developer, Frontend Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Search Keywords & Technologies
                  </label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="React, TypeScript, Next.js, Node.js"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Target Locations
                  </label>
                  <input
                    type="text"
                    value={locationsText}
                    onChange={(e) => setLocationsText(e.target.value)}
                    placeholder="Remote, San Francisco, CA, New York, NY"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Minimum Match Score for Notifications
                    </label>
                    <span className="text-xs font-bold text-indigo-400">{minMatchScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Only jobs scoring at or above this threshold generate alerts in your notification center.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" type="submit">
                    Save Schedule Configuration
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Webhook & Cron Technical Documentation */}
          <Card className="border-slate-800">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                Vercel Cron & External Webhook Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-400">
              <p>
                JobPilot AI provides an idempotent HTTP endpoint designed for Vercel Cron or GitHub Actions runners:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                POST /api/cron/job-search
                <br />
                Authorization: Bearer {'<CRON_SECRET>'}
              </div>
              <p>
                The endpoint executes securely without exposing credentials, persists discovered jobs, and returns execution metrics in JSON.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Execution Logs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  Recent Execution Logs
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  {scheduledRuns.length} Runs
                </Badge>
              </div>
              <CardDescription>Audited history of automated and manual triggers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledRuns.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No execution logs recorded yet.</p>
              ) : (
                scheduledRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          run.status === 'SUCCESS' ? 'success' : run.status === 'PARTIAL_FAILURE' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {run.status}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-mono">{run.durationMs}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 pt-1">
                      <span>Discovered:</span>
                      <span className="font-semibold text-slate-100">{run.jobsDiscovered} jobs</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>New Jobs Stored:</span>
                      <span className="font-semibold text-indigo-400">{run.newJobsStored}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>High Match Found:</span>
                      <span className="font-semibold text-emerald-400">{run.highMatchJobsFound}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{new Date(run.executedAt).toLocaleString()}</span>
                      <span>{run.sourcesChecked.join(', ')}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Responsible Automation Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Only connects to official, public endpoints without scraping.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Enforces strict rate limits and 8-second request timeouts.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero spam: High-score threshold prevents notification flooding.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

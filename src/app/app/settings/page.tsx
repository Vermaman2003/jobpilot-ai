'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Database,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { masterResume, applications, jobs, emails, tailoredResumes, coverLetters, preferences, updatePreferences } =
    useApp();

  const [aiProvider, setAiProvider] = useState<'DETERMINISTIC' | 'GEMINI'>('DETERMINISTIC');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [apiKeyTested, setApiKeyTested] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [apiKeyTestMessage, setApiKeyTestMessage] = useState<string | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Preference fields
  const [targetSalary, setTargetSalary] = useState(preferences.targetSalary || 135000);
  const [minSalary, setMinSalary] = useState(preferences.minSalary || 105000);
  const [currency, setCurrency] = useState(preferences.currency || 'USD');
  const [excludedCompaniesText, setExcludedCompaniesText] = useState(
    preferences.excludedCompanies.join(', ')
  );

  React.useEffect(() => {
    const savedKey = localStorage.getItem('jobpilot_gemini_api_key');
    if (savedKey) setGeminiApiKey(savedKey);
    const savedProvider = localStorage.getItem('jobpilot_ai_provider');
    if (savedProvider === 'GEMINI' || savedProvider === 'DETERMINISTIC') {
      setAiProvider(savedProvider);
    }
  }, []);

  const handleTestApiKey = async () => {
    if (!geminiApiKey.trim()) {
      setApiKeyTested('ERROR');
      setApiKeyTestMessage('Please enter a Gemini API key.');
      return;
    }
    setIsTestingKey(true);
    setApiKeyTestMessage(null);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: geminiApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeyTested('SUCCESS');
        setApiKeyTestMessage(data.message || 'Successfully connected to Google Gemini Flash API!');
        localStorage.setItem('jobpilot_gemini_api_key', geminiApiKey);
      } else {
        setApiKeyTested('ERROR');
        setApiKeyTestMessage(data.message || 'Authentication failed. Please verify your key.');
      }
    } catch (err: any) {
      setApiKeyTested('ERROR');
      setApiKeyTestMessage(err.message || 'Network error while testing API key.');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('jobpilot_ai_provider', aiProvider);
    if (geminiApiKey.trim()) {
      localStorage.setItem('jobpilot_gemini_api_key', geminiApiKey.trim());
    }
    updatePreferences({
      targetSalary: Number(targetSalary),
      minSalary: Number(minSalary),
      currency,
      excludedCompanies: excludedCompaniesText
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  const handleExportData = () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      masterResume,
      preferences,
      applications,
      jobs,
      emails,
      tailoredResumes,
      coverLetters,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jobpilot_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data to initial demo state? This will clear local storage.')) {
      localStorage.removeItem('jobpilot_ai_state_v1');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Platform Settings & Privacy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure AI reasoning engines, financial parameters, data export, and candidate privacy controls.
        </p>
      </div>

      {/* AI Provider Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                AI Provider Architecture (Zero-Mandatory-Cost)
              </CardTitle>
              <CardDescription>
                JobPilot AI works 100% offline out-of-the-box using deterministic heuristic engines, or with Google Gemini API free-tier.
              </CardDescription>
            </div>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Zero Cost Guaranteed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              onClick={() => setAiProvider('DETERMINISTIC')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                aiProvider === 'DETERMINISTIC'
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">Deterministic Engine</span>
                {aiProvider === 'DETERMINISTIC' && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero API keys, zero network latency, 100% offline rule-based action verbs and skill gap extraction.
              </p>
            </div>

            <div
              onClick={() => setAiProvider('GEMINI')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                aiProvider === 'GEMINI'
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">Google Gemini Flash</span>
                {aiProvider === 'GEMINI' && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Uses Gemini 1.5/2.0 Flash on the Google AI Studio 100% free tier (15 requests/min quota).
              </p>
            </div>
          </div>

          {aiProvider === 'GEMINI' && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini API Key (Stored locally in browser only)
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Get free key at Google AI Studio &rarr;
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <Button variant="outline" size="sm" onClick={handleTestApiKey} isLoading={isTestingKey}>
                  Test Connection
                </Button>
              </div>

              {apiKeyTested === 'SUCCESS' && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {apiKeyTestMessage || 'Gemini API connection verified successfully!'}
                </p>
              )}
              {apiKeyTested === 'ERROR' && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {apiKeyTestMessage || 'Authentication failed. Please verify your Gemini API key.'}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial & Compensation Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Salary & Role Preferences</CardTitle>
            {savedSettingsNotice && (
              <Badge variant="success" size="sm">
                Saved!
              </Badge>
            )}
          </div>
          <CardDescription>
            Defines your target compensation expectations and company exclusions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Target Annual Salary</label>
                <input
                  type="number"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Minimum Annual Salary</label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Excluded Companies (Comma-separated)
              </label>
              <input
                type="text"
                value={excludedCompaniesText}
                onChange={(e) => setExcludedCompaniesText(e.target.value)}
                placeholder="Company A, Company B"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Jobs from these companies will be flagged or deprioritized in match calculations.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" type="submit">
                Save Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data Management & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Data Ownership & Local Storage Backup
          </CardTitle>
          <CardDescription>
            You have complete sovereignty over your resume, applications, and activity history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Export All Data (JSON)</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Download an unencrypted JSON archive containing your master profile, applications, tailored versions, and audit logs.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData} className="shrink-0">
              <Download className="w-4 h-4 mr-1.5" />
              Download Backup
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-rose-950/20 rounded-xl border border-rose-900/30">
            <div>
              <h4 className="text-sm font-semibold text-rose-300">Reset All Demo State</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Clears all stored applications, modified resume facts, and restores initial sample data.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={handleResetData} className="shrink-0">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Reset State
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Guarantee */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200 block">Candidate Privacy Guarantee</span>
          <p>
            JobPilot AI never sells, shares, or transmits your resume or job search history to third-party data brokers.
            All provenance analysis runs either locally in your browser or through direct encrypted API calls.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Mail,
  Clock,
  History,
  ExternalLink,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { ApplicationStatus, TailoredResume, CoverLetter } from '@/types';
import { SideBySideTailor } from '@/components/tailoring/SideBySideTailor';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function ApplicationWorkspacePage() {
  const params = useParams();
  const {
    applications,
    masterResume,
    tailoredResumes,
    tailorResumeForApp,
    updateTailoredResume,
    coverLetters,
    generateCoverLetterForApp,
    updateCoverLetter,
    updateApplicationStatus,
    updateApplicationNotes,
  } = useApp();

  const appId = params.id as string;
  const application = applications.find((a) => a.id === appId);

  const [activeTab, setActiveTab] = useState<'tailor' | 'cover_letter' | 'notes' | 'history'>('tailor');
  const [isTailoring, setIsTailoring] = useState(false);
  const [notesText, setNotesText] = useState(application?.notes || '');
  const [followUpDate, setFollowUpDate] = useState(application?.followUpDate || '');
  const [isCopiedCoverLetter, setIsCopiedCoverLetter] = useState(false);

  useEffect(() => {
    if (application) {
      setNotesText(application.notes);
      setFollowUpDate(application.followUpDate || '');
    }
  }, [application]);

  if (!application) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-200">Application Not Found</h2>
        <Link href="/app/applications">
          <Button size="sm" variant="outline">
            Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  const tailoredResume = application.tailoredResumeId ? tailoredResumes[application.tailoredResumeId] : undefined;
  const coverLetter = application.coverLetterId ? coverLetters[application.coverLetterId] : undefined;

  const handleGenerateTailored = async () => {
    setIsTailoring(true);
    try {
      await tailorResumeForApp(application.id);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleGenerateCoverLetter = () => {
    generateCoverLetterForApp(application.id);
  };

  const handleSaveNotes = () => {
    updateApplicationNotes(application.id, notesText, followUpDate);
    alert('Notes and follow-up saved.');
  };

  const handleCopyCoverLetter = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter.content);
      setIsCopiedCoverLetter(true);
      setTimeout(() => setIsCopiedCoverLetter(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/app/applications"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Pipeline
        </Link>
      </div>

      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {application.job.company}
            </span>
            <Badge variant="neutral" size="sm">
              Match: {application.matchScore.score}%
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">{application.job.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>{application.job.location}</span>
            <span>•</span>
            <span>{application.job.workArrangement}</span>
            <span>•</span>
            <span>Discovered: {new Date(application.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stage Selector & Assisted Portal Link */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Stage:</span>
            <select
              value={application.status}
              onChange={(e) => updateApplicationStatus(application.id, e.target.value as ApplicationStatus)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="TAILORING">Tailoring</option>
              <option value="READY_TO_APPLY">Ready to Apply</option>
              <option value="APPLIED">Applied (Submitted)</option>
              <option value="CONFIRMATION_RECEIVED">Confirmation Received</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <a href={application.job.applicationUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Official Portal
            </Button>
          </a>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tailor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'tailor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          Truthful Tailored Resume
        </button>

        <button
          onClick={() => setActiveTab('cover_letter')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'cover_letter'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Mail className="w-4 h-4" />
          Cover Letter
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Clock className="w-4 h-4" />
          Notes & Follow-ups
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <History className="w-4 h-4" />
          Activity Log ({application.activities.length})
        </button>
      </div>

      {/* Tab 1: Truthful Resume Workspace */}
      {activeTab === 'tailor' && (
        <div className="space-y-4">
          {!tailoredResume ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-100">
                  Generate Tailored Resume for {application.job.company}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  JobPilot AI emphasizes your real, verified master skills using action verbs and validates claim
                  provenance. No invented achievements or hallucinated skills.
                </p>
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleGenerateTailored}
                  isLoading={isTailoring}
                  icon={<Sparkles className="w-4 h-4 mr-1" />}
                >
                  Generate Truthful Tailored Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <SideBySideTailor
              application={application}
              masterResume={masterResume}
              tailoredResume={tailoredResume}
              onUpdateTailored={updateTailoredResume}
            />
          )}
        </div>
      )}

      {/* Tab 2: Truthful Cover Letter */}
      {activeTab === 'cover_letter' && (
        <div className="space-y-4">
          {!coverLetter ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Mail className="w-10 h-10 text-indigo-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-100">Generate Truthful Cover Letter</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Constructs a job-specific cover letter grounded strictly in your verified experiences and matching skills.
                </p>
                <Button size="md" variant="primary" onClick={handleGenerateCoverLetter}>
                  Create Cover Letter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400">Grounded in verified master facts:</span>{' '}
                  {coverLetter.groundedFacts.join(' • ')}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCoverLetter}
                  icon={isCopiedCoverLetter ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                >
                  {isCopiedCoverLetter ? 'Copied to Clipboard' : 'Copy Text'}
                </Button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <textarea
                  rows={14}
                  value={coverLetter.content}
                  onChange={(e) => updateCoverLetter({ ...coverLetter, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notes & Follow-ups */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Notes & Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Follow-Up Due Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Interview Preparation & Submission Notes
                </label>
                <textarea
                  rows={6}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record interviewer names, questions asked, salary discussions, or key talking points..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <Button size="sm" variant="primary" onClick={handleSaveNotes} icon={<Save className="w-4 h-4 mr-1" />}>
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Activity Log */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {application.activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-100">{act.description}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Type: {act.type}</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {new Date(act.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

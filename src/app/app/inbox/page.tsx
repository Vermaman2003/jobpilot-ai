'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Mail,
  CheckCircle2,
  Calendar,
  Building,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Award,
  AlertCircle,
  FileCheck,
  XCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmailClassificationType, ProcessedEmail } from '@/types';

export default function InboxPage() {
  const { emails, verifyEmailClassification, syncMockEmails, applications } = useApp();
  const [filter, setFilter] = useState<'ALL' | EmailClassificationType>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    syncMockEmails();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const filteredEmails = useMemo(() => {
    if (filter === 'ALL') return emails;
    return emails.filter((e) => e.classification === filter);
  }, [emails, filter]);

  // Counts
  const counts = useMemo(() => {
    const total = emails.length;
    const interviews = emails.filter((e) => e.classification === 'INTERVIEW_INVITATION').length;
    const offers = emails.filter((e) => e.classification === 'OFFER').length;
    const confirmations = emails.filter((e) => e.classification === 'APPLICATION_CONFIRMATION').length;
    const rejections = emails.filter((e) => e.classification === 'REJECTION').length;
    const unmatched = emails.filter((e) => e.classification === 'UNMATCHED').length;
    const verified = emails.filter((e) => e.isUserVerified).length;
    return { total, interviews, offers, confirmations, rejections, unmatched, verified };
  }, [emails]);

  const getClassificationBadge = (type: EmailClassificationType) => {
    switch (type) {
      case 'OFFER':
        return (
          <Badge variant="primary" size="sm" className="bg-indigo-900/60 text-indigo-300 border-indigo-700">
            <Award className="w-3 h-3 mr-1" />
            Offer of Employment
          </Badge>
        );
      case 'INTERVIEW_INVITATION':
        return (
          <Badge variant="success" size="sm">
            <Calendar className="w-3 h-3 mr-1 text-emerald-400" />
            Interview Invitation
          </Badge>
        );
      case 'APPLICATION_CONFIRMATION':
        return (
          <Badge variant="neutral" size="sm">
            <FileCheck className="w-3 h-3 mr-1 text-sky-400" />
            Confirmation Received
          </Badge>
        );
      case 'REJECTION':
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="w-3 h-3 mr-1 text-rose-400" />
            Not Moving Forward
          </Badge>
        );
      case 'RECRUITER_OUTREACH':
        return (
          <Badge variant="warning" size="sm">
            <Mail className="w-3 h-3 mr-1 text-amber-400" />
            Recruiter Outreach
          </Badge>
        );
      case 'UNMATCHED':
      default:
        return (
          <Badge variant="neutral" size="sm">
            <AlertCircle className="w-3 h-3 mr-1 text-slate-400" />
            Unmatched / General
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Inbox className="w-6 h-6 text-indigo-400" />
              Response Inbox Intelligence
            </h1>
            <Badge variant="neutral" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1 text-indigo-400" />
              Read-Only Security
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automatically categorizes recruiter responses, interview requests, and application status updates.
            Verifying classifications immediately updates your application pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" isLoading={isSyncing} onClick={handleSync}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Messages
          </Button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
            filter === 'ALL'
              ? 'bg-slate-800 border-indigo-500/60 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-slate-400 font-medium uppercase block">Total Messages</span>
          <span className="text-xl font-bold text-slate-100 mt-0.5 block">{counts.total}</span>
        </div>

        <div
          onClick={() => setFilter('INTERVIEW_INVITATION')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
            filter === 'INTERVIEW_INVITATION'
              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-emerald-400 font-medium uppercase block">Interviews</span>
          <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{counts.interviews}</span>
        </div>

        <div
          onClick={() => setFilter('OFFER')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
            filter === 'OFFER'
              ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-indigo-400 font-medium uppercase block">Offers</span>
          <span className="text-xl font-bold text-indigo-400 mt-0.5 block">{counts.offers}</span>
        </div>

        <div
          onClick={() => setFilter('APPLICATION_CONFIRMATION')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
            filter === 'APPLICATION_CONFIRMATION'
              ? 'bg-sky-950/40 border-sky-500/60 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-sky-400 font-medium uppercase block">Confirmations</span>
          <span className="text-xl font-bold text-sky-400 mt-0.5 block">{counts.confirmations}</span>
        </div>

        <div
          onClick={() => setFilter('REJECTION')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
            filter === 'REJECTION'
              ? 'bg-rose-950/40 border-rose-500/60 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-rose-400 font-medium uppercase block">Rejections</span>
          <span className="text-xl font-bold text-rose-400 mt-0.5 block">{counts.rejections}</span>
        </div>

        <div
          onClick={() => setFilter('UNMATCHED')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
            filter === 'UNMATCHED'
              ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-amber-400 font-medium uppercase block">Unmatched</span>
          <span className="text-xl font-bold text-amber-400 mt-0.5 block">{counts.unmatched}</span>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">No emails in this category</h3>
              <p className="text-xs text-slate-400 mt-1">
                Sync fresh emails or choose a different category to view processed communications.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email) => {
            const matchedApp = applications.find((a) => a.id === email.associatedApplicationId);

            return (
              <Card key={email.id} className="transition-all hover:border-slate-700">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Sender and Classification Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getClassificationBadge(email.classification)}

                        <span className="text-[11px] font-mono text-slate-400">
                          {Math.round(email.confidence * 100)}% Confidence
                        </span>

                        {email.isUserVerified ? (
                          <Badge variant="success" size="sm" className="bg-emerald-950/60 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            User Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Pending Review
                          </Badge>
                        )}

                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(email.dateReceived).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Subject and Sender */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">{email.subject}</h3>
                        <p className="text-xs text-indigo-400 font-mono mt-0.5">From: {email.sender}</p>
                      </div>

                      {/* Snippet */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        {email.snippet}
                      </p>

                      {/* Evidence Tags */}
                      {email.evidence && email.evidence.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                          <span className="font-medium text-slate-500">Supporting Evidence:</span>
                          {email.evidence.map((ev, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-800/80 rounded text-slate-300">
                              {ev}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right column: Association and Actions */}
                    <div className="lg:w-72 shrink-0 flex flex-col justify-between gap-3 pt-3 lg:pt-0 lg:border-l lg:border-slate-800 lg:pl-5">
                      <div>
                        <span className="text-[11px] font-medium text-slate-400 block mb-1">
                          Tracked Application:
                        </span>
                        {matchedApp ? (
                          <Link
                            href={`/app/applications/${matchedApp.id}`}
                            className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500/50 block group transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-200 group-hover:text-indigo-400 truncate">
                                {matchedApp.job.title}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                              <Building className="w-3 h-3 text-slate-500" />
                              <span className="truncate">{matchedApp.job.company}</span>
                              <Badge variant="neutral" size="sm" className="ml-auto text-[10px]">
                                {matchedApp.status}
                              </Badge>
                            </div>
                          </Link>
                        ) : (
                          <div className="p-2.5 bg-amber-950/20 border border-amber-900/30 rounded-lg text-xs text-amber-300">
                            <span>No application currently linked.</span>
                          </div>
                        )}
                      </div>

                      {/* Verification Action */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        {!email.isUserVerified ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => verifyEmailClassification(email.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Confirm & Update Pipeline
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium py-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Classification Verified
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Correct status:</span>
                          <select
                            value={email.classification}
                            onChange={(e) => verifyEmailClassification(email.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="INTERVIEW_INVITATION">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="APPLICATION_CONFIRMATION">Confirmation</option>
                            <option value="RECRUITER_OUTREACH">Recruiter Reachout</option>
                            <option value="REJECTION">Rejection</option>
                            <option value="UNMATCHED">Unmatched</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

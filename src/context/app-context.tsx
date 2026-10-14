'use client';

/**
 * JobPilot AI — Global Application Context & State Provider
 * Manages full lifecycle states, optimistic updates, and persistent local storage.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Application,
  ApplicationStatus,
  AppNotification,
  CandidatePreferences,
  CoverLetter,
  JobPosting,
  MasterResume,
  ProcessedEmail,
  ScheduledSearchConfig,
  ScheduledSearchRun,
  TailoredResume,
} from '@/types';
import {
  DEFAULT_APPLICATIONS,
  DEFAULT_JOBS,
  DEFAULT_MASTER_RESUME,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PREFERENCES,
  DEFAULT_SCHEDULED_CONFIG,
  DEFAULT_SCHEDULED_RUNS,
} from '@/lib/store';
import { EmailService } from '@/lib/email/email-service';
import { RelevanceScorer } from '@/lib/scoring/relevance-scorer';
import { TailoringService } from '@/lib/tailoring/tailor-service';
import { DiscoveryEngine } from '@/lib/discovery/discovery-engine';
import { CsvJobAdapter } from '@/lib/discovery/adapters/csv-import';
import { CronService } from '@/lib/scheduler/cron-service';

export interface DashboardStats {
  totalDiscovered: number;
  totalShortlisted: number;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
  totalRejections: number;
  responseRate: number; // percentage
  upcomingFollowUpsCount: number;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  exactMatch?: Application;
  sameCompanyMatch?: Application;
  sameUrlMatch?: Application;
}

interface AppContextType {
  masterResume: MasterResume;
  updateMasterResume: (resume: MasterResume) => void;
  preferences: CandidatePreferences;
  updatePreferences: (prefs: Partial<CandidatePreferences>) => void;
  jobs: JobPosting[];
  addJobs: (newJobs: JobPosting[]) => void;
  importCsvJobs: (csvText: string) => number;
  refreshPublicJobs: (query?: string) => Promise<{ addedCount: number; errors: string[] }>;
  applications: Application[];
  createApplication: (jobId: string) => Application;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  updateApplicationNotes: (appId: string, notes: string, followUpDate?: string) => void;
  checkDuplicateApplication: (jobId: string) => Application | undefined;
  checkDuplicateDetails: (job: JobPosting) => DuplicateCheckResult;
  tailoredResumes: Record<string, TailoredResume>;
  tailorResumeForApp: (appId: string) => Promise<TailoredResume>;
  updateTailoredResume: (tailored: TailoredResume) => void;
  coverLetters: Record<string, CoverLetter>;
  generateCoverLetterForApp: (appId: string) => CoverLetter;
  updateCoverLetter: (cl: CoverLetter) => void;
  emails: ProcessedEmail[];
  verifyEmailClassification: (emailId: string, correctedStatus?: string) => void;
  syncMockEmails: () => void;
  scheduledConfig: ScheduledSearchConfig;
  updateScheduledConfig: (config: Partial<ScheduledSearchConfig>) => void;
  scheduledRuns: ScheduledSearchRun[];
  triggerManualSearchRun: () => Promise<ScheduledSearchRun>;
  notifications: AppNotification[];
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
  stats: DashboardStats;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'jobpilot_ai_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [masterResume, setMasterResume] = useState<MasterResume>(DEFAULT_MASTER_RESUME);
  const [preferences, setPreferences] = useState<CandidatePreferences>(DEFAULT_PREFERENCES);
  const [jobs, setJobs] = useState<JobPosting[]>(DEFAULT_JOBS);
  const [applications, setApplications] = useState<Application[]>(DEFAULT_APPLICATIONS);
  const [tailoredResumes, setTailoredResumes] = useState<Record<string, TailoredResume>>({});
  const [coverLetters, setCoverLetters] = useState<Record<string, CoverLetter>>({});
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [scheduledConfig, setScheduledConfig] = useState<ScheduledSearchConfig>(DEFAULT_SCHEDULED_CONFIG);
  const [scheduledRuns, setScheduledRuns] = useState<ScheduledSearchRun[]>(DEFAULT_SCHEDULED_RUNS);
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);

  // Initialize from LocalStorage or seed defaults on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.masterResume) setMasterResume(parsed.masterResume);
        if (parsed.preferences) setPreferences(parsed.preferences);
        if (parsed.jobs && parsed.jobs.length > 0) setJobs(parsed.jobs);
        if (parsed.applications && parsed.applications.length > 0) setApplications(parsed.applications);
        if (parsed.tailoredResumes) setTailoredResumes(parsed.tailoredResumes);
        if (parsed.coverLetters) setCoverLetters(parsed.coverLetters);
        if (parsed.emails && parsed.emails.length > 0) setEmails(parsed.emails);
        else setEmails(EmailService.getMockInbox(DEFAULT_APPLICATIONS));
        if (parsed.scheduledConfig) setScheduledConfig(parsed.scheduledConfig);
        if (parsed.scheduledRuns) setScheduledRuns(parsed.scheduledRuns);
        if (parsed.notifications) setNotifications(parsed.notifications);
      } else {
        setEmails(EmailService.getMockInbox(DEFAULT_APPLICATIONS));
      }
    } catch {
      setEmails(EmailService.getMockInbox(DEFAULT_APPLICATIONS));
    }
  }, []);

  // Sync state to LocalStorage on updates
  useEffect(() => {
    if (!isMounted) return;
    try {
      const payload = {
        masterResume,
        preferences,
        jobs,
        applications,
        tailoredResumes,
        coverLetters,
        emails,
        scheduledConfig,
        scheduledRuns,
        notifications,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [
    isMounted,
    masterResume,
    preferences,
    jobs,
    applications,
    tailoredResumes,
    coverLetters,
    emails,
    scheduledConfig,
    scheduledRuns,
    notifications,
  ]);

  const updateMasterResume = (newResume: MasterResume) => {
    setMasterResume(newResume);
  };

  const updatePreferences = (newPrefs: Partial<CandidatePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  const addJobs = (newJobs: JobPosting[]) => {
    setJobs((prev) => DiscoveryEngine.deduplicateJobs([...newJobs, ...prev]));
  };

  const importCsvJobs = (csvText: string): number => {
    const parsed = CsvJobAdapter.parseCsv(csvText);
    if (parsed.length > 0) {
      addJobs(parsed);
    }
    return parsed.length;
  };

  const refreshPublicJobs = async (query?: string): Promise<{ addedCount: number; errors: string[] }> => {
    const engine = new DiscoveryEngine();
    const result = await engine.discoverAll(DiscoveryEngine.DEFAULT_BOARDS, { query, limitPerSource: 10 });
    const existingKeys = new Set(jobs.map((j) => `${j.source}::${j.externalId}`));
    const newItems = result.jobs.filter((j) => !existingKeys.has(`${j.source}::${j.externalId}`));

    if (newItems.length > 0) {
      addJobs(newItems);
    }

    return {
      addedCount: newItems.length,
      errors: result.errors.map((e) => `${e.source}: ${e.error}`),
    };
  };

  const checkDuplicateApplication = (jobId: string): Application | undefined => {
    return applications.find((a) => a.jobId === jobId);
  };

  const checkDuplicateDetails = (job: JobPosting): DuplicateCheckResult => {
    const exactMatch = applications.find((a) => a.jobId === job.id);
    const sameUrlMatch = job.applicationUrl
      ? applications.find(
          (a) => a.jobId !== job.id && a.job.applicationUrl && a.job.applicationUrl === job.applicationUrl
        )
      : undefined;
    const sameCompanyMatch = applications.find(
      (a) =>
        a.jobId !== job.id &&
        a.job.company.trim().toLowerCase() === job.company.trim().toLowerCase()
    );

    return {
      hasDuplicate: Boolean(exactMatch || sameCompanyMatch || sameUrlMatch),
      exactMatch,
      sameCompanyMatch,
      sameUrlMatch,
    };
  };

  const createApplication = (jobId: string): Application => {
    const existing = checkDuplicateApplication(jobId);
    if (existing) return existing;

    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) throw new Error('Job not found');

    const matchBreakdown = RelevanceScorer.calculateMatch(masterResume, preferences, targetJob);
    const newApp: Application = {
      id: `app_${Date.now()}`,
      userId: masterResume.userId,
      jobId: targetJob.id,
      job: targetJob,
      status: 'SHORTLISTED',
      matchScore: matchBreakdown,
      notes: '',
      activities: [
        {
          id: `act_${Date.now()}`,
          applicationId: `app_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'STATUS_CHANGE',
          description: `Shortlisted ${targetJob.title} at ${targetJob.company}.`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const activity = {
          id: `act_${Date.now()}`,
          applicationId: app.id,
          timestamp: new Date().toISOString(),
          type: (status === 'APPLIED' ? 'APPLIED' : 'STATUS_CHANGE') as any,
          description: `Status changed from ${app.status} to ${status}.`,
        };
        return {
          ...app,
          status,
          appliedAt: status === 'APPLIED' && !app.appliedAt ? new Date().toISOString() : app.appliedAt,
          activities: [activity, ...app.activities],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateApplicationNotes = (appId: string, notes: string, followUpDate?: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          notes,
          followUpDate: followUpDate || app.followUpDate,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const tailorResumeForApp = async (appId: string): Promise<TailoredResume> => {
    const app = applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const match = RelevanceScorer.calculateMatch(masterResume, preferences, app.job);
    const tailored = await TailoringService.tailorResume(masterResume, app.job, match, appId);

    setTailoredResumes((prev) => ({ ...prev, [tailored.id]: tailored }));
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, tailoredResumeId: tailored.id, status: 'TAILORING' } : a))
    );

    return tailored;
  };

  const updateTailoredResume = (tailored: TailoredResume) => {
    setTailoredResumes((prev) => ({ ...prev, [tailored.id]: tailored }));
  };

  const generateCoverLetterForApp = (appId: string): CoverLetter => {
    const app = applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const tailored = app.tailoredResumeId ? tailoredResumes[app.tailoredResumeId] : undefined;
    const dummyTailored: TailoredResume = tailored || {
      id: `tailored_${Date.now()}`,
      applicationId: appId,
      masterResumeId: masterResume.id,
      targetJobTitle: app.job.title,
      targetCompany: app.job.company,
      summary: masterResume.summary || '',
      provenanceMap: [],
      tailoredExperiences: [],
      tailoredProjects: [],
      highlightedSkills: masterResume.skills.map((s) => s.name).slice(0, 5),
      reportedSkillGaps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cl = TailoringService.generateCoverLetter(masterResume, app.job, dummyTailored, appId);
    setCoverLetters((prev) => ({ ...prev, [cl.id]: cl }));
    setApplications((prev) => (prev.map((a) => (a.id === appId ? { ...a, coverLetterId: cl.id } : a))));
    return cl;
  };

  const updateCoverLetter = (cl: CoverLetter) => {
    setCoverLetters((prev) => ({ ...prev, [cl.id]: cl }));
  };

  const verifyEmailClassification = (emailId: string, correctedStatus?: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id !== emailId) return email;
        const verified = {
          ...email,
          isUserVerified: true,
          classification: (correctedStatus as any) || email.classification,
        };

        // If matched to an application, update application status if user verified
        if (verified.associatedApplicationId) {
          if (verified.classification === 'INTERVIEW_INVITATION') {
            updateApplicationStatus(verified.associatedApplicationId, 'INTERVIEW');
          } else if (verified.classification === 'OFFER') {
            updateApplicationStatus(verified.associatedApplicationId, 'OFFER');
          } else if (verified.classification === 'REJECTION') {
            updateApplicationStatus(verified.associatedApplicationId, 'REJECTED');
          } else if (verified.classification === 'APPLICATION_CONFIRMATION') {
            updateApplicationStatus(verified.associatedApplicationId, 'CONFIRMATION_RECEIVED');
          }
        }

        return verified;
      })
    );
  };

  const syncMockEmails = () => {
    const mock = EmailService.getMockInbox(applications);
    setEmails(mock);
  };

  const updateScheduledConfig = (config: Partial<ScheduledSearchConfig>) => {
    setScheduledConfig((prev) => ({ ...prev, ...config }));
  };

  const triggerManualSearchRun = async (): Promise<ScheduledSearchRun> => {
    const { runRecord, newJobs, notifications: newNotifs } = await CronService.executeScheduledSearch(
      scheduledConfig,
      masterResume,
      preferences,
      jobs
    );

    if (newJobs.length > 0) {
      addJobs(newJobs);
    }
    if (newNotifs.length > 0) {
      setNotifications((prev) => [...newNotifs, ...prev]);
    }
    setScheduledRuns((prev) => [runRecord, ...prev]);
    setScheduledConfig((prev) => ({ ...prev, lastRunAt: runRecord.executedAt }));
    return runRecord;
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Derived real persisted metrics
  const stats: DashboardStats = useMemo(() => {
    const totalDiscovered = jobs.length;
    const totalShortlisted = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'SAVED').length;
    const appliedApps = applications.filter((a) =>
      ['APPLIED', 'CONFIRMATION_RECEIVED', 'RECRUITER_CONTACT', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status)
    );
    const totalApplied = appliedApps.length;
    const totalInterviews = applications.filter((a) => a.status === 'INTERVIEW').length;
    const totalOffers = applications.filter((a) => a.status === 'OFFER').length;
    const totalRejections = applications.filter((a) => a.status === 'REJECTED').length;

    const responseCount = applications.filter((a) =>
      ['CONFIRMATION_RECEIVED', 'RECRUITER_CONTACT', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status)
    ).length;

    const responseRate = totalApplied > 0 ? Math.round((responseCount / totalApplied) * 100) : 0;

    const now = new Date();
    const upcomingFollowUpsCount = applications.filter((a) => {
      if (!a.followUpDate) return false;
      const fDate = new Date(a.followUpDate);
      return fDate >= now && !['REJECTED', 'OFFER', 'WITHDRAWN', 'CLOSED'].includes(a.status);
    }).length;

    return {
      totalDiscovered,
      totalShortlisted,
      totalApplied,
      totalInterviews,
      totalOffers,
      totalRejections,
      responseRate,
      upcomingFollowUpsCount,
    };
  }, [jobs, applications]);

  return (
    <AppContext.Provider
      value={{
        masterResume,
        updateMasterResume,
        preferences,
        updatePreferences,
        jobs,
        addJobs,
        importCsvJobs,
        refreshPublicJobs,
        applications,
        createApplication,
        updateApplicationStatus,
        updateApplicationNotes,
        checkDuplicateApplication,
        checkDuplicateDetails,
        tailoredResumes,
        tailorResumeForApp,
        updateTailoredResume,
        coverLetters,
        generateCoverLetterForApp,
        updateCoverLetter,
        emails,
        verifyEmailClassification,
        syncMockEmails,
        scheduledConfig,
        updateScheduledConfig,
        scheduledRuns,
        triggerManualSearchRun,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        stats,
        isMounted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

/**
 * JobPilot AI — Scheduled Daily Job Search Runner
 * 
 * Non-Negotiable Rules:
 * 1. Secured with CRON_SECRET token authorization.
 * 2. Idempotent execution: stores execution records and prevents duplicate notifications.
 * 3. Discovers jobs from permitted public boards (Greenhouse/Lever).
 * 4. Scores new jobs against candidate profile and preferences.
 * 5. Generates high-priority in-app notifications only for high-match roles.
 */

import { DiscoveryEngine } from '../discovery/discovery-engine';
import { RelevanceScorer } from '../scoring/relevance-scorer';
import {
  AppNotification,
  CandidatePreferences,
  JobPosting,
  MasterResume,
  ScheduledSearchConfig,
  ScheduledSearchRun,
} from '@/types';

export class CronService {
  /**
   * Run automated scheduled search pipeline.
   */
  public static async executeScheduledSearch(
    config: ScheduledSearchConfig,
    masterResume: MasterResume,
    preferences: CandidatePreferences,
    existingJobs: JobPosting[] = []
  ): Promise<{
    runRecord: ScheduledSearchRun;
    newJobs: JobPosting[];
    notifications: AppNotification[];
  }> {
    const startTime = Date.now();
    const engine = new DiscoveryEngine();
    const existingIds = new Set(existingJobs.map((j) => `${j.source}::${j.externalId}`));

    const query = config.keywords.length > 0 ? config.keywords[0] : undefined;

    const { jobs, errors } = await engine.discoverAll(
      {
        greenhouseBoards: DiscoveryEngine.DEFAULT_BOARDS.greenhouse,
        leverCompanies: DiscoveryEngine.DEFAULT_BOARDS.lever,
      },
      { query, limitPerSource: 10 }
    );

    const newJobs: JobPosting[] = [];
    const notifications: AppNotification[] = [];
    let highMatchCount = 0;

    for (const job of jobs) {
      const key = `${job.source}::${job.externalId}`;
      if (!existingIds.has(key)) {
        newJobs.push(job);
        existingIds.add(key);

        // Evaluate match score
        const match = RelevanceScorer.calculateMatch(masterResume, preferences, job);
        if (match.score >= config.minMatchScore) {
          highMatchCount++;
          notifications.push({
            id: `notif_${Date.now()}_${notifications.length + 1}`,
            userId: config.userId,
            type: 'NEW_JOBS',
            title: `New High-Match Job (${match.score}%): ${job.title}`,
            message: `${job.company} posted "${job.title}" in ${job.location} matching your profile.`,
            link: `/app/jobs/${job.id}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const runRecord: ScheduledSearchRun = {
      id: `run_${Date.now()}`,
      configId: config.id,
      executedAt: new Date().toISOString(),
      jobsDiscovered: jobs.length,
      newJobsStored: newJobs.length,
      highMatchJobsFound: highMatchCount,
      status: errors.length === 0 ? 'SUCCESS' : newJobs.length > 0 ? 'PARTIAL_FAILURE' : 'FAILED',
      sourcesChecked: ['Greenhouse Boards', 'Lever Postings'],
      errors: errors.map((e) => `${e.source}: ${e.error}`),
      durationMs,
    };

    return {
      runRecord,
      newJobs,
      notifications,
    };
  }
}

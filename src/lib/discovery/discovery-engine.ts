/**
 * JobPilot AI — Job Discovery Engine
 * Coordinates multiple compliant providers, deduplicates listings, and applies filters.
 */

import { JobPosting, JobQueryOptions } from '@/types';
import { GreenhouseAdapter } from './adapters/greenhouse';
import { LeverAdapter } from './adapters/lever';

export interface DiscoveryConfig {
  greenhouseBoards?: string[]; // e.g. ['stripe', 'airbnb', 'figma', 'gitlab', 'github']
  leverCompanies?: string[];   // e.g. ['netflix', 'palantir', 'atlassian']
  greenhouse?: string[];
  lever?: string[];
}

export class DiscoveryEngine {
  private greenhouseAdapter = new GreenhouseAdapter();
  private leverAdapter = new LeverAdapter();

  /**
   * Default popular tech companies with public boards for instant demo exploration.
   */
  public static readonly DEFAULT_BOARDS: DiscoveryConfig = {
    greenhouseBoards: ['stripe', 'figma', 'gitlab', 'discord', 'reddit', 'dropbox'],
    leverCompanies: ['netflix', 'palantir', 'benchling'],
    greenhouse: ['stripe', 'figma', 'gitlab', 'discord', 'reddit', 'dropbox'],
    lever: ['netflix', 'palantir', 'benchling'],
  };

  /**
   * Normalize company name and title for duplicate detection.
   */
  public static generateDedupKey(company: string, title: string, location: string): string {
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLoc = location.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    return `${cleanCompany}__${cleanTitle}__${cleanLoc}`;
  }

  /**
   * Deduplicate an array of jobs using externalId and normalized company+title keys.
   */
  public static deduplicateJobs(jobs: JobPosting[]): JobPosting[] {
    const seenExternalIds = new Set<string>();
    const seenContentKeys = new Set<string>();
    const deduplicated: JobPosting[] = [];

    for (const job of jobs) {
      const extKey = `${job.source}::${job.externalId}`;
      if (seenExternalIds.has(extKey)) continue;

      const contentKey = this.generateDedupKey(job.company, job.title, job.location);
      if (seenContentKeys.has(contentKey)) continue;

      seenExternalIds.add(extKey);
      seenContentKeys.add(contentKey);
      deduplicated.push(job);
    }

    return deduplicated;
  }

  /**
   * Discover jobs across all configured public sources.
   */
  public async discoverAll(
    config: DiscoveryConfig = DiscoveryEngine.DEFAULT_BOARDS,
    options?: { query?: string; limitPerSource?: number }
  ): Promise<{ jobs: JobPosting[]; errors: { source: string; error: string }[] }> {
    const allJobs: JobPosting[] = [];
    const errors: { source: string; error: string }[] = [];

    const greenhouseBoards = config.greenhouseBoards || config.greenhouse || DiscoveryEngine.DEFAULT_BOARDS.greenhouse || [];
    const leverCompanies = config.leverCompanies || config.lever || DiscoveryEngine.DEFAULT_BOARDS.lever || [];

    const limit = options?.limitPerSource || 15;

    // Greenhouse queries
    for (const board of greenhouseBoards) {
      try {
        const jobs = await this.greenhouseAdapter.fetchJobs(board, {
          query: options?.query,
          limit,
        });
        allJobs.push(...jobs);
      } catch (err: any) {
        errors.push({ source: `Greenhouse (${board})`, error: err.message || 'Failed to fetch' });
      }
    }

    // Lever queries
    for (const company of leverCompanies) {
      try {
        const jobs = await this.leverAdapter.fetchJobs(company, {
          query: options?.query,
          limit,
        });
        allJobs.push(...jobs);
      } catch (err: any) {
        errors.push({ source: `Lever (${company})`, error: err.message || 'Failed to fetch' });
      }
    }

    const uniqueJobs = DiscoveryEngine.deduplicateJobs(allJobs);
    return {
      jobs: uniqueJobs,
      errors,
    };
  }
}

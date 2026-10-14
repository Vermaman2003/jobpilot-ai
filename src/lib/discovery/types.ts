/**
 * JobPilot AI — Job Source Adapter Specification
 */

import { JobPosting, JobSourceType } from '@/types';

export interface JobQueryOptions {
  query?: string;
  location?: string;
  department?: string;
  limit?: number;
}

export interface JobSourceAdapter {
  sourceName: JobSourceType;
  fetchJobs(sourceIdentifier: string, options?: JobQueryOptions): Promise<JobPosting[]>;
  testConnection(sourceIdentifier: string): Promise<boolean>;
}

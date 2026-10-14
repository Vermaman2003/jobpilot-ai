import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CronService } from '@/lib/scheduler/cron-service';
import { DiscoveryEngine } from '@/lib/discovery/discovery-engine';
import { DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_SCHEDULED_CONFIG, DEFAULT_JOBS } from '@/lib/store';

describe('CronService', () => {
  beforeEach(() => {
    // Mock discoverAll to return deterministic job fixtures for fast unit testing
    vi.spyOn(DiscoveryEngine.prototype, 'discoverAll').mockResolvedValue({
      jobs: [DEFAULT_JOBS[0], DEFAULT_JOBS[1]],
      errors: [],
    });
  });

  it('executes scheduled search and returns structured runRecord and notifications', async () => {
    const result = await CronService.executeScheduledSearch(
      DEFAULT_SCHEDULED_CONFIG,
      DEFAULT_MASTER_RESUME,
      DEFAULT_PREFERENCES,
      []
    );

    expect(result.runRecord).toBeDefined();
    expect(result.runRecord.configId).toBe(DEFAULT_SCHEDULED_CONFIG.id);
    expect(result.runRecord.status).toBe('SUCCESS');
    expect(result.newJobs.length).toBe(2);
    expect(result.runRecord.durationMs).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.notifications)).toBe(true);
  });

  it('prevents duplicate processing for previously existing job IDs', async () => {
    // Run search once
    const initial = await CronService.executeScheduledSearch(
      DEFAULT_SCHEDULED_CONFIG,
      DEFAULT_MASTER_RESUME,
      DEFAULT_PREFERENCES,
      []
    );

    // Run again passing in the newly discovered jobs as existing
    const secondRun = await CronService.executeScheduledSearch(
      DEFAULT_SCHEDULED_CONFIG,
      DEFAULT_MASTER_RESUME,
      DEFAULT_PREFERENCES,
      initial.newJobs
    );

    // New jobs count should be 0 because all were already existing
    expect(secondRun.newJobs.length).toBe(0);
  });
});

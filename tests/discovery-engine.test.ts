import { describe, it, expect } from 'vitest';
import { DiscoveryEngine } from '@/lib/discovery/discovery-engine';
import { CsvJobAdapter } from '@/lib/discovery/adapters/csv-import';
import { JobPosting } from '@/types';

describe('DiscoveryEngine & CSV Adapter', () => {
  it('deduplicates jobs with identical external IDs or company/title', () => {
    const jobA: JobPosting = {
      id: 'job_1',
      externalId: 'ext_100',
      title: 'Senior Frontend Engineer',
      company: 'Acme Corp',
      location: 'Remote',
      workArrangement: 'REMOTE',
      employmentType: 'FULL_TIME',
      description: 'Job desc A',
      requiredSkills: ['React', 'TypeScript'],
      preferredSkills: [],
      source: 'GREENHOUSE',
      sourceUrl: 'https://example.com/1',
      applicationUrl: 'https://example.com/1',
      status: 'ACTIVE',
      discoveredAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    };

    const duplicateSameExtId: JobPosting = {
      ...jobA,
      id: 'job_2',
      title: 'Senior Frontend Engineer (Newer Post)',
    };

    const duplicateSameContent: JobPosting = {
      ...jobA,
      id: 'job_3',
      externalId: 'ext_101', // different ext id but same company and title and location
    };

    const distinctJob: JobPosting = {
      ...jobA,
      id: 'job_4',
      externalId: 'ext_102',
      title: 'Backend Systems Engineer',
    };

    const deduped = DiscoveryEngine.deduplicateJobs([jobA, duplicateSameExtId, duplicateSameContent, distinctJob]);
    expect(deduped.length).toBe(2);
    expect(deduped.map((j) => j.id)).toContain('job_1');
    expect(deduped.map((j) => j.id)).toContain('job_4');
  });

  it('correctly parses CSV content with varying header names and quotes', () => {
    const csvData = `Title,Company,Location,Arrangement,Skills
"Software Engineer, Full Stack","TechCo, Inc.","San Francisco, CA",Remote,"React; TypeScript; Node.js"
Senior Backend Developer,CloudScale,Remote,Remote,"Go, Kubernetes, Docker"`;

    const jobs = CsvJobAdapter.parseCsv(csvData);
    expect(jobs.length).toBe(2);
    expect(jobs[0].title).toBe('Software Engineer, Full Stack');
    expect(jobs[0].company).toBe('TechCo, Inc.');
    expect(jobs[0].workArrangement).toBe('REMOTE');
    expect(jobs[0].requiredSkills).toContain('React');
    expect(jobs[0].requiredSkills).toContain('TypeScript');

    expect(jobs[1].title).toBe('Senior Backend Developer');
    expect(jobs[1].company).toBe('CloudScale');
  });

  it('throws an informative error if essential columns are missing', () => {
    const invalidCsv = `Salary,Location,Status\n100000,Remote,Active`;
    expect(() => CsvJobAdapter.parseCsv(invalidCsv)).toThrowError(
      /must contain at least "Title" and "Company"/
    );
  });
});

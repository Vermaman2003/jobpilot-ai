import { describe, it, expect } from 'vitest';
import { RelevanceScorer } from '@/lib/scoring/relevance-scorer';
import { DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_JOBS } from '@/lib/store';
import { JobPosting } from '@/types';

describe('RelevanceScorer', () => {
  const master = DEFAULT_MASTER_RESUME;
  const prefs = DEFAULT_PREFERENCES;
  const sampleJob = DEFAULT_JOBS[0]; // Senior Full Stack Engineer at Stripe

  it('calculates explainable score within normalized 0-100 range', () => {
    const result = RelevanceScorer.calculateMatch(master, prefs, sampleJob);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.explanation).toBeDefined();
    expect(result.matchingSkills.length).toBeGreaterThan(0);
  });

  it('accurately identifies matching skills and missing skills', () => {
    const mockJob: JobPosting = {
      ...sampleJob,
      requiredSkills: ['TypeScript', 'React', 'COBOL', 'Fortran'],
      preferredSkills: ['Next.js', 'PostgreSQL'],
    };

    const result = RelevanceScorer.calculateMatch(master, prefs, mockJob);
    // TypeScript and React are in master resume
    expect(result.matchingSkills).toContain('TypeScript');
    expect(result.matchingSkills).toContain('React');
    // COBOL and Fortran are not in master resume
    expect(result.missingRequiredSkills).toContain('COBOL');
    expect(result.missingRequiredSkills).toContain('Fortran');
  });

  it('caps score and flags critical gaps for extreme experience deficits', () => {
    const principalRole: JobPosting = {
      ...sampleJob,
      title: 'Principal Architect',
      minExperienceMonths: 120, // 10 years, candidate has ~2 years
      requiredSkills: ['TypeScript', 'System Design', 'React'],
    };

    const result = RelevanceScorer.calculateMatch(master, prefs, principalRole);
    expect(result.experienceGapMonths).toBeGreaterThanOrEqual(24);
    expect(result.criticalGaps.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(55); // Capped by safety rule
  });

  it('penalizes excluded companies and notes critical gap', () => {
    const customPrefs = {
      ...prefs,
      excludedCompanies: ['BlockedCorp'],
    };

    const blockedJob: JobPosting = {
      ...sampleJob,
      company: 'BlockedCorp',
    };

    const result = RelevanceScorer.calculateMatch(master, customPrefs, blockedJob);
    expect(result.criticalGaps.some((g) => g.includes('BlockedCorp'))).toBe(true);
    expect(result.isEligible).toBe(false);
  });
});

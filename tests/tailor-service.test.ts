import { describe, it, expect } from 'vitest';
import { TailoringService } from '@/lib/tailoring/tailor-service';
import { RelevanceScorer } from '@/lib/scoring/relevance-scorer';
import { DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_JOBS } from '@/lib/store';

describe('TailoringService', () => {
  const master = DEFAULT_MASTER_RESUME;
  const prefs = DEFAULT_PREFERENCES;
  const sampleJob = DEFAULT_JOBS[0];

  it('enhances bullet action verbs without altering underlying metrics', () => {
    const original = 'worked on frontend dashboard with React and reduced query times by 40%';
    const result = TailoringService.enhanceBulletDeterministically(original, ['React']);

    expect(result.tailoredText).toContain('Engineered');
    expect(result.tailoredText).toContain('40%');
    expect(result.actionVerb).toBe('Engineered');
  });

  it('tailors resume and records complete provenance for every bullet', async () => {
    const match = RelevanceScorer.calculateMatch(master, prefs, sampleJob);
    const tailored = await TailoringService.tailorResume(master, sampleJob, match, 'app_test_1');

    expect(tailored.targetJobTitle).toBe(sampleJob.title);
    expect(tailored.targetCompany).toBe(sampleJob.company);
    expect(tailored.provenanceMap.length).toBeGreaterThan(0);
    // Every bullet has a provenance entry
    tailored.provenanceMap.forEach((prov) => {
      expect(['VERIFIED', 'SUPPORTED_WITH_REPHRASING', 'UNSUPPORTED_FLAGGED']).toContain(
        prov.status
      );
    });
  });

  it('transparently reports skill gaps instead of hallucinating missing skills', async () => {
    const jobWithRareSkills = {
      ...sampleJob,
      requiredSkills: ['TypeScript', 'Solidity', 'Cobol', 'Fortran'],
    };

    const match = RelevanceScorer.calculateMatch(master, prefs, jobWithRareSkills);
    const tailored = await TailoringService.tailorResume(master, jobWithRareSkills, match, 'app_test_2');

    // Reported skill gaps should list the missing skills
    expect(tailored.reportedSkillGaps).toContain('Solidity');
    expect(tailored.reportedSkillGaps).toContain('Cobol');

    // Highlighted skills should NOT contain the missing skills!
    expect(tailored.highlightedSkills).not.toContain('Solidity');
    expect(tailored.highlightedSkills).not.toContain('Cobol');
  });

  it('generates a truthful cover letter strictly grounded in master facts', async () => {
    const match = RelevanceScorer.calculateMatch(master, prefs, sampleJob);
    const tailored = await TailoringService.tailorResume(master, sampleJob, match, 'app_test_3');
    const coverLetter = TailoringService.generateCoverLetter(master, sampleJob, tailored, 'app_test_3');

    expect(coverLetter.companyName).toBe(sampleJob.company);
    expect(coverLetter.content).toContain(master.contact.fullName);
    expect(coverLetter.content).toContain(sampleJob.title);
    expect(coverLetter.groundedFacts.length).toBeGreaterThan(0);
  });
});

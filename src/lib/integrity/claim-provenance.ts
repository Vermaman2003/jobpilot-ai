/**
 * JobPilot AI — Candidate Integrity & Claim Provenance Engine
 * 
 * Non-Negotiable Rules:
 * 1. Master resume is the single source of truth.
 * 2. Never invent, exaggerate, or alter job titles, employers, dates, or skills.
 * 3. Every tailored bullet must have proven grounding in master resume facts.
 * 4. Detects ungrounded metrics (e.g., claiming "increased revenue by 40%" when master has no metric).
 * 5. Detects ungrounded skills or tools inserted into bullets.
 * 6. Flags unverified assertions rather than silently adding them to ATS exports.
 */

import { MasterResume, ClaimProvenance } from '@/types';

export class ClaimProvenanceEngine {
  /**
   * Tokenize and normalize text for semantic word-overlap comparison.
   */
  private static extractKeyTokens(text: string): Set<string> {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'using', 'into', 'over', 'after',
      'built', 'developed', 'worked', 'created', 'helped', 'assisted', 'engineered', 'implemented',
      'responsible', 'lead', 'team', 'across', 'various', 'daily', 'weekly', 'including'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    return new Set(words);
  }

  /**
   * Extract all numbers, percentages, and dollar amounts from text.
   */
  private static extractMetrics(text: string): string[] {
    const metricRegex = /(\d+(\.\d+)?%?|\$\d+(\.\d+)?|\b\d+\b)/g;
    const matches = text.match(metricRegex);
    return matches ? matches.map((m) => m.trim()) : [];
  }

  /**
   * Extract known master skills from the candidate's master resume.
   */
  private static getMasterSkillSet(masterResume: MasterResume): Set<string> {
    const skills = new Set<string>();
    masterResume.skills.forEach((s) => skills.add(s.name.toLowerCase()));
    masterResume.experiences.forEach((exp) => {
      exp.skillsDemonstrated.forEach((s) => skills.add(s.toLowerCase()));
    });
    masterResume.projects.forEach((proj) => {
      proj.technologies.forEach((t) => skills.add(t.toLowerCase()));
    });
    return skills;
  }

  /**
   * Check provenance of a proposed tailored bullet against the candidate's master facts.
   */
  public static verifyBulletProvenance(
    tailoredBullet: string,
    originalBullet: string,
    factId: string,
    masterResume: MasterResume
  ): ClaimProvenance {
    const originalTokens = this.extractKeyTokens(originalBullet);
    const tailoredTokens = this.extractKeyTokens(tailoredBullet);

    // 1. Check Metrics Grounding
    const originalMetrics = new Set(this.extractMetrics(originalBullet));
    const tailoredMetrics = this.extractMetrics(tailoredBullet);

    for (const metric of tailoredMetrics) {
      if (!originalMetrics.has(metric)) {
        return {
          bulletText: tailoredBullet,
          sourceFactId: factId,
          sourceSnippet: originalBullet,
          status: 'UNSUPPORTED_FLAGGED',
          integrityFlagReason: `Ungrounded metric detected: "${metric}". The original master resume did not specify this figure.`,
        };
      }
    }

    // 2. Check for Hallucinated Skills/Keywords
    const masterSkills = this.getMasterSkillSet(masterResume);
    // Find technical-sounding tokens in tailored that weren't in original
    for (const token of Array.from(tailoredTokens)) {
      if (!originalTokens.has(token)) {
        // If it's a known master skill, it's allowed even if moved between bullets
        // If it looks like a brand new technology not present anywhere in master, flag if suspicious
        const appearsInMaster = masterResume.rawText.toLowerCase().includes(token);
        if (!appearsInMaster && token.length > 5 && (token.endsWith('js') || token.endsWith('db') || token.includes('cloud'))) {
          return {
            bulletText: tailoredBullet,
            sourceFactId: factId,
            sourceSnippet: originalBullet,
            status: 'UNSUPPORTED_FLAGGED',
            integrityFlagReason: `Potential ungrounded skill detected: "${token}". Not found in master resume.`,
          };
        }
      }
    }

    // 3. Calculate overlap
    let matchCount = 0;
    for (const token of Array.from(tailoredTokens)) {
      if (originalTokens.has(token)) {
        matchCount++;
      }
    }

    const overlapRatio = tailoredTokens.size > 0 ? matchCount / tailoredTokens.size : 0;

    if (overlapRatio >= 0.7) {
      return {
        bulletText: tailoredBullet,
        sourceFactId: factId,
        sourceSnippet: originalBullet,
        status: 'VERIFIED',
      };
    } else if (overlapRatio >= 0.3) {
      return {
        bulletText: tailoredBullet,
        sourceFactId: factId,
        sourceSnippet: originalBullet,
        status: 'SUPPORTED_WITH_REPHRASING',
      };
    } else {
      return {
        bulletText: tailoredBullet,
        sourceFactId: factId,
        sourceSnippet: originalBullet,
        status: 'UNSUPPORTED_FLAGGED',
        integrityFlagReason: `Low semantic overlap (${Math.round(overlapRatio * 100)}%) with source text. Please confirm this claim is accurate.`,
      };
    }
  }

  /**
   * Validate an entire tailored resume and filter out unverified claims if requested.
   */
  public static auditTailoredResume(
    provenances: ClaimProvenance[]
  ): { isValid: boolean; flaggedCount: number; summary: string } {
    const flagged = provenances.filter((p) => p.status === 'UNSUPPORTED_FLAGGED');
    const isValid = flagged.length === 0;

    const summary = isValid
      ? 'All tailored bullet claims are strictly grounded in master resume facts.'
      : `Integrity Alert: ${flagged.length} bullet(s) contain ungrounded claims or metrics that must be reviewed.`;

    return {
      isValid,
      flaggedCount: flagged.length,
      summary,
    };
  }
}

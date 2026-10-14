/**
 * JobPilot AI — Explainable Relevance Scoring Engine
 * 
 * Non-Negotiable Rules:
 * 1. Normalized 0-100 score based on transparent, deterministic factors.
 * 2. Never claims to predict hireability or guarantee interviews.
 * 3. Highlights exact matching skills vs missing requirements.
 * 4. Flags critical eligibility gaps (visa sponsorship, major experience deficit) separately.
 * 5. Provides human-readable, auditable breakdown.
 */

import { CandidatePreferences, ExperienceCalculation, JobMatchBreakdown, JobPosting, MasterResume } from '@/types';
import { ExperienceClassifier } from '../classification/experience-classifier';

export class RelevanceScorer {
  /**
   * Normalize text tokens for skill matching.
   */
  private static normalizeToken(str: string): string {
    return str.toLowerCase().replace(/[\.\-_]/g, '').trim();
  }

  /**
   * Calculate relevance between candidate master resume/preferences and a job posting.
   */
  public static calculateMatch(
    masterResume: MasterResume,
    preferences: CandidatePreferences,
    job: JobPosting
  ): JobMatchBreakdown {
    // 1. Gather all candidate skills from Master Resume
    const candidateSkillMap = new Map<string, string>(); // normalized -> original
    masterResume.skills.forEach((s) => candidateSkillMap.set(this.normalizeToken(s.name), s.name));
    masterResume.experiences.forEach((exp) => {
      exp.skillsDemonstrated.forEach((s) => candidateSkillMap.set(this.normalizeToken(s), s));
    });
    masterResume.projects.forEach((p) => {
      p.technologies.forEach((t) => candidateSkillMap.set(this.normalizeToken(t), t));
    });

    // 2. Evaluate Required Skills Alignment
    const matchingSkills: string[] = [];
    const missingRequiredSkills: string[] = [];

    const jobDescriptionLower = job.description.toLowerCase();

    // Check declared required skills
    for (const reqSkill of job.requiredSkills) {
      const norm = this.normalizeToken(reqSkill);
      let found = false;

      for (const [candNorm, original] of Array.from(candidateSkillMap.entries())) {
        if (candNorm === norm || candNorm.includes(norm) || norm.includes(candNorm)) {
          matchingSkills.push(reqSkill);
          found = true;
          break;
        }
      }

      if (!found) {
        missingRequiredSkills.push(reqSkill);
      }
    }

    // Check declared preferred skills
    const missingPreferredSkills: string[] = [];
    for (const prefSkill of job.preferredSkills) {
      const norm = this.normalizeToken(prefSkill);
      let found = false;

      for (const [candNorm] of Array.from(candidateSkillMap.entries())) {
        if (candNorm === norm || candNorm.includes(norm) || norm.includes(candNorm)) {
          if (!matchingSkills.includes(prefSkill)) {
            matchingSkills.push(prefSkill);
          }
          found = true;
          break;
        }
      }

      if (!found) {
        missingPreferredSkills.push(prefSkill);
      }
    }

    // Required skills ratio (40% weight)
    const totalRequired = job.requiredSkills.length;
    const requiredMatchCount = totalRequired - missingRequiredSkills.length;
    const skillAlignmentScore = totalRequired > 0 ? (requiredMatchCount / totalRequired) * 40 : 35;

    // 3. Evaluate Experience Alignment (25% weight)
    const experienceCalc = ExperienceClassifier.calculateExperience(masterResume.experiences);
    const requiredMonths = job.minExperienceMonths || 0;
    let experienceAlignmentScore = 25;
    let experienceGapMonths = 0;

    if (requiredMonths > 0) {
      if (experienceCalc.totalRelevantMonths >= requiredMonths) {
        experienceAlignmentScore = 25;
      } else {
        experienceGapMonths = requiredMonths - experienceCalc.totalRelevantMonths;
        const ratio = experienceCalc.totalRelevantMonths / requiredMonths;
        experienceAlignmentScore = Math.max(0, Math.round(ratio * 25));
      }
    }

    // 4. Evaluate Title and Role Alignment (20% weight)
    let titleAlignmentScore = 0;
    const jobTitleLower = job.title.toLowerCase();
    let bestTitleMatchRatio = 0;

    const candidateTargetRoles = [
      ...preferences.targetRoles,
      ...masterResume.experiences.map((e) => e.jobTitle),
    ];

    for (const role of candidateTargetRoles) {
      const roleTokens = role.toLowerCase().split(/\s+/);
      let matchedTokens = 0;
      for (const tok of roleTokens) {
        if (tok.length > 2 && jobTitleLower.includes(tok)) {
          matchedTokens++;
        }
      }
      const matchRatio = roleTokens.length > 0 ? matchedTokens / roleTokens.length : 0;
      if (matchRatio > bestTitleMatchRatio) {
        bestTitleMatchRatio = matchRatio;
      }
    }

    titleAlignmentScore = Math.round(bestTitleMatchRatio * 20);

    // 5. Evaluate Work Arrangement & Location (15% weight)
    let preferenceAlignmentScore = 0;
    // Arrangement check
    if (
      preferences.preferredArrangements.length === 0 ||
      preferences.preferredArrangements.includes(job.workArrangement)
    ) {
      preferenceAlignmentScore += 8;
    }

    // Location check
    if (
      job.workArrangement === 'REMOTE' ||
      preferences.preferredLocations.length === 0 ||
      preferences.preferredLocations.some((loc) => job.location.toLowerCase().includes(loc.toLowerCase()))
    ) {
      preferenceAlignmentScore += 7;
    }

    // 6. Critical Gaps Detection
    const criticalGaps: string[] = [];

    // Experience gap > 24 months is a critical gap
    if (experienceGapMonths >= 24) {
      criticalGaps.push(
        `Experience Deficit: Role seeks ${Math.round(requiredMonths / 12)}+ years; candidate has ${Math.round(experienceCalc.totalRelevantMonths / 12)} years total relevant experience.`
      );
    }

    // Missing more than 60% of required skills
    if (totalRequired >= 3 && missingRequiredSkills.length / totalRequired > 0.6) {
      criticalGaps.push(
        `Critical Skill Gaps: Missing ${missingRequiredSkills.length} of ${totalRequired} mandatory requirements (${missingRequiredSkills.slice(0, 3).join(', ')}...).`
      );
    }

    // Excluded company check
    if (preferences.excludedCompanies.some((c) => job.company.toLowerCase().includes(c.toLowerCase()))) {
      criticalGaps.push(`Excluded Company: ${job.company} is on your excluded companies list.`);
    }

    const totalRawScore = Math.round(
      skillAlignmentScore + experienceAlignmentScore + titleAlignmentScore + preferenceAlignmentScore
    );
    // If critical gap exists, cap score at 55 to prevent misleading recommendations
    const finalScore = criticalGaps.length > 0 ? Math.min(55, totalRawScore) : Math.min(100, totalRawScore);
    const isEligible = criticalGaps.length === 0 && finalScore >= preferences.minimumMatchScore;

    // Build explanatory text
    const explanationParts: string[] = [
      `Overall match score is ${finalScore}/100.`,
      `Skills: matched ${matchingSkills.length} skills (${Math.round((skillAlignmentScore / 40) * 100)}% required match).`,
      `Experience: candidate has ${experienceCalc.totalRelevantMonths} mo relevant (${experienceCalc.fullTimeMonths} mo full-time).`,
    ];

    if (missingRequiredSkills.length > 0) {
      explanationParts.push(`Key skill gaps to address: ${missingRequiredSkills.join(', ')}.`);
    }

    return {
      score: finalScore,
      skillAlignmentScore: Math.round(skillAlignmentScore),
      experienceAlignmentScore: Math.round(experienceAlignmentScore),
      titleAlignmentScore: Math.round(titleAlignmentScore),
      preferenceAlignmentScore: Math.round(preferenceAlignmentScore),
      matchingSkills,
      missingRequiredSkills,
      missingPreferredSkills,
      experienceGapMonths,
      isEligible,
      criticalGaps,
      explanation: explanationParts.join(' '),
    };
  }
}

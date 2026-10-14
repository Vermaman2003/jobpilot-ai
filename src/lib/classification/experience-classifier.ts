/**
 * JobPilot AI — Explicit Internship and Experience Classification Engine
 * 
 * Non-Negotiable Rules:
 * 1. Preserves original title and employment type.
 * 2. Never relabels an internship as a full-time job.
 * 3. Does not count academic projects or course work as professional employment.
 * 4. Does not double-count overlapping dates when summing experience.
 * 5. Calculates total duration in months accurately from YYYY-MM strings.
 * 6. Explicitly distinguishes Total Relevant Experience from Full-Time Employment Experience.
 * 7. Transparently documents every deduction and calculation step.
 */

import { CandidateExperience, EmploymentCategory, ExperienceCalculation } from '@/types';

export class ExperienceClassifier {
  /**
   * Parse a YYYY-MM date string into Year and Month.
   */
  private static parseYearMonth(dateStr: string): { year: number; month: number } | null {
    if (!dateStr) return null;
    const parts = dateStr.trim().split(/[-/]/);
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        return { year, month };
      }
    }
    return null;
  }

  /**
   * Convert YYYY-MM to an absolute month index for overlap deduplication.
   */
  private static toMonthIndex(year: number, month: number): number {
    return year * 12 + (month - 1);
  }

  /**
   * Calculate duration in months between two dates inclusive.
   */
  public static calculateDurationMonths(startDate: string, endDate?: string, isCurrent: boolean = false): number {
    const start = this.parseYearMonth(startDate);
    if (!start) return 0;

    let endYear: number;
    let endMonth: number;

    if (isCurrent || !endDate) {
      const now = new Date();
      endYear = now.getFullYear();
      endMonth = now.getMonth() + 1;
    } else {
      const end = this.parseYearMonth(endDate);
      if (!end) return 0;
      endYear = end.year;
      endMonth = end.month;
    }

    const startIdx = this.toMonthIndex(start.year, start.month);
    const endIdx = this.toMonthIndex(endYear, endMonth);

    if (endIdx < startIdx) return 0;
    // Inclusive: Jan to Mar is 3 months (Jan, Feb, Mar)
    return endIdx - startIdx + 1;
  }

  /**
   * Classify job title keywords if employment category is missing or ambiguous.
   */
  public static detectCategoryFromTitle(title: string): EmploymentCategory {
    const lower = title.toLowerCase();

    if (lower.includes('intern') || lower.includes('trainee') || lower.includes('fellow')) {
      return 'INTERNSHIP';
    }
    if (lower.includes('co-op') || lower.includes('coop')) {
      return 'CO_OP';
    }
    if (lower.includes('research assistant') || lower.includes('graduate assistant') || lower.includes('teaching assistant')) {
      return 'RESEARCH_ASSISTANT';
    }
    if (lower.includes('freelance') || lower.includes('contractor') || lower.includes('contract')) {
      return 'CONTRACT';
    }
    if (lower.includes('academic project') || lower.includes('capstone') || lower.includes('thesis')) {
      return 'ACADEMIC_PROJECT';
    }
    if (lower.includes('part-time') || lower.includes('part time')) {
      return 'PART_TIME';
    }
    return 'FULL_TIME';
  }

  /**
   * Compute deduplicated monthly experience across all categories.
   */
  public static calculateExperience(experiences: CandidateExperience[]): ExperienceCalculation {
    const fullTimeMonthsSet = new Set<number>();
    const internshipMonthsSet = new Set<number>();
    const coOpMonthsSet = new Set<number>();
    const academicMonthsSet = new Set<number>();
    const allRelevantMonthsSet = new Set<number>();

    const explanations: string[] = [];

    // Sort experiences chronologically
    const sorted = [...experiences].sort((a, b) => a.startDate.localeCompare(b.startDate));

    for (const exp of sorted) {
      const start = this.parseYearMonth(exp.startDate);
      if (!start) {
        explanations.push(`Skipped "${exp.jobTitle} at ${exp.employer}": invalid start date (${exp.startDate}).`);
        continue;
      }

      let endYear: number;
      let endMonth: number;

      if (exp.isCurrent || !exp.endDate) {
        const now = new Date();
        endYear = now.getFullYear();
        endMonth = now.getMonth() + 1;
      } else {
        const end = this.parseYearMonth(exp.endDate);
        if (!end) {
          explanations.push(`Invalid end date for "${exp.jobTitle} at ${exp.employer}"; defaulting to start month.`);
          endYear = start.year;
          endMonth = start.month;
        } else {
          endYear = end.year;
          endMonth = end.month;
        }
      }

      const startIdx = this.toMonthIndex(start.year, start.month);
      const endIdx = this.toMonthIndex(endYear, endMonth);
      const count = Math.max(0, endIdx - startIdx + 1);

      explanations.push(
        `Analyzed: "${exp.jobTitle}" at ${exp.employer} (${exp.category}) from ${exp.startDate} to ${exp.endDate || 'Present'} (${count} months).`
      );

      // Never count academic projects as professional employment
      if (exp.category === 'ACADEMIC_PROJECT') {
        for (let m = startIdx; m <= endIdx; m++) {
          academicMonthsSet.add(m);
        }
        explanations.push(
          `  -> Note: Classified as Academic Project. Excluded from professional employment calculation.`
        );
        continue;
      }

      // Populate category sets
      for (let m = startIdx; m <= endIdx; m++) {
        allRelevantMonthsSet.add(m);

        if (exp.category === 'FULL_TIME') {
          fullTimeMonthsSet.add(m);
        } else if (exp.category === 'INTERNSHIP') {
          internshipMonthsSet.add(m);
        } else if (exp.category === 'CO_OP') {
          coOpMonthsSet.add(m);
        }
      }
    }

    const totalRelevantMonths = allRelevantMonthsSet.size;
    const fullTimeMonths = fullTimeMonthsSet.size;
    const internshipMonths = internshipMonthsSet.size;
    const coOpMonths = coOpMonthsSet.size;
    const academicMonths = academicMonthsSet.size;

    explanations.push(
      `Summary: Total Deduplicated Relevant Experience = ${totalRelevantMonths} months (~${(totalRelevantMonths / 12).toFixed(1)} yrs). Full-Time Professional Experience = ${fullTimeMonths} months (~${(fullTimeMonths / 12).toFixed(1)} yrs). Internships = ${internshipMonths} months. Co-Ops = ${coOpMonths} months.`
    );

    return {
      totalRelevantMonths,
      fullTimeMonths,
      internshipMonths,
      coOpMonths,
      academicMonths,
      explanation: explanations,
    };
  }

  /**
   * Determine eligibility against a minimum required experience in months.
   */
  public static evaluateExperienceEligibility(
    calculation: ExperienceCalculation,
    requiredMonths: number,
    requiresFullTimeOnly: boolean = false
  ): { isEligible: boolean; gapMonths: number; reason: string } {
    if (requiredMonths <= 0) {
      return {
        isEligible: true,
        gapMonths: 0,
        reason: 'No minimum experience specified for this role.',
      };
    }

    const candidateMonths = requiresFullTimeOnly ? calculation.fullTimeMonths : calculation.totalRelevantMonths;
    const gap = Math.max(0, requiredMonths - candidateMonths);

    if (gap === 0) {
      return {
        isEligible: true,
        gapMonths: 0,
        reason: `Candidate has ${candidateMonths} months experience, meeting the required ${requiredMonths} months.`,
      };
    }

    return {
      isEligible: false,
      gapMonths: gap,
      reason: `Experience gap of ${gap} months (${(gap / 12).toFixed(1)} years). Role requires ${requiredMonths} months; candidate has ${candidateMonths} ${requiresFullTimeOnly ? 'full-time ' : 'relevant '}months.`,
    };
  }
}

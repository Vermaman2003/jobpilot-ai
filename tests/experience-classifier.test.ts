import { describe, it, expect } from 'vitest';
import { ExperienceClassifier } from '@/lib/classification/experience-classifier';
import { CandidateExperience } from '@/types';

describe('ExperienceClassifier', () => {
  it('correctly calculates duration in months between two dates inclusive', () => {
    // 2023-01 to 2023-03 is 3 months (Jan, Feb, Mar)
    const duration = ExperienceClassifier.calculateDurationMonths('2023-01', '2023-03');
    expect(duration).toBe(3);
  });

  it('correctly calculates multi-year durations', () => {
    // 2021-01 to 2022-12 is 24 months
    const duration = ExperienceClassifier.calculateDurationMonths('2021-01', '2022-12');
    expect(duration).toBe(24);
  });

  it('detects employment category from ambiguous job titles', () => {
    expect(ExperienceClassifier.detectCategoryFromTitle('Software Engineering Intern')).toBe('INTERNSHIP');
    expect(ExperienceClassifier.detectCategoryFromTitle('Engineering Co-op')).toBe('CO_OP');
    expect(ExperienceClassifier.detectCategoryFromTitle('Graduate Research Assistant')).toBe('RESEARCH_ASSISTANT');
    expect(ExperienceClassifier.detectCategoryFromTitle('Frontend Contractor')).toBe('CONTRACT');
    expect(ExperienceClassifier.detectCategoryFromTitle('Senior Full Stack Engineer')).toBe('FULL_TIME');
    expect(ExperienceClassifier.detectCategoryFromTitle('Capstone Academic Project')).toBe('ACADEMIC_PROJECT');
  });

  it('strictly excludes academic projects from employment duration', () => {
    const experiences: CandidateExperience[] = [
      {
        id: 'exp_1',
        employer: 'University Project',
        jobTitle: 'Capstone Project',
        category: 'ACADEMIC_PROJECT',
        compensationType: 'ACADEMIC_CREDIT',
        startDate: '2022-01',
        endDate: '2022-05',
        isCurrent: false,
        durationMonths: 5,
        responsibilities: ['Built a compiler'],
        skillsDemonstrated: ['C++'],
        isVerified: true,
      },
      {
        id: 'exp_2',
        employer: 'Acme Corp',
        jobTitle: 'Junior Developer',
        category: 'FULL_TIME',
        compensationType: 'PAID',
        startDate: '2023-01',
        endDate: '2023-06',
        isCurrent: false,
        durationMonths: 6,
        responsibilities: ['Developed web app'],
        skillsDemonstrated: ['React'],
        isVerified: true,
      },
    ];

    const result = ExperienceClassifier.calculateExperience(experiences);
    expect(result.academicMonths).toBe(5);
    expect(result.fullTimeMonths).toBe(6);
    expect(result.totalRelevantMonths).toBe(6); // academic project excluded!
  });

  it('prevents double-counting overlapping dates across jobs', () => {
    const experiences: CandidateExperience[] = [
      {
        id: 'exp_1',
        employer: 'Company A',
        jobTitle: 'Software Engineer',
        category: 'FULL_TIME',
        compensationType: 'PAID',
        startDate: '2022-01',
        endDate: '2022-06', // 6 months
        isCurrent: false,
        durationMonths: 6,
        responsibilities: [],
        skillsDemonstrated: [],
        isVerified: true,
      },
      {
        id: 'exp_2',
        employer: 'Company B',
        jobTitle: 'Frontend Intern',
        category: 'INTERNSHIP',
        compensationType: 'PAID',
        startDate: '2022-04', // Overlaps with Company A for 3 months (April, May, June)
        endDate: '2022-08', // Total 5 months (Apr to Aug)
        isCurrent: false,
        durationMonths: 5,
        responsibilities: [],
        skillsDemonstrated: [],
        isVerified: true,
      },
    ];

    const result = ExperienceClassifier.calculateExperience(experiences);
    // Jan to Aug is 8 total distinct months
    expect(result.totalRelevantMonths).toBe(8);
    expect(result.fullTimeMonths).toBe(6);
    expect(result.internshipMonths).toBe(5);
  });

  it('evaluates experience eligibility and flags deficits', () => {
    const calc = {
      totalRelevantMonths: 18,
      fullTimeMonths: 12,
      internshipMonths: 6,
      coOpMonths: 0,
      academicMonths: 0,
      explanation: [],
    };

    // Role requiring 12 months -> eligible
    const eligibleCheck = ExperienceClassifier.evaluateExperienceEligibility(calc, 12);
    expect(eligibleCheck.isEligible).toBe(true);
    expect(eligibleCheck.gapMonths).toBe(0);

    // Role requiring 24 months -> ineligible with 6 months gap
    const ineligibleCheck = ExperienceClassifier.evaluateExperienceEligibility(calc, 24);
    expect(ineligibleCheck.isEligible).toBe(false);
    expect(ineligibleCheck.gapMonths).toBe(6);

    // Role requiring 18 months full-time only -> candidate has 12 -> 6 months gap
    const fullTimeCheck = ExperienceClassifier.evaluateExperienceEligibility(calc, 18, true);
    expect(fullTimeCheck.isEligible).toBe(false);
    expect(fullTimeCheck.gapMonths).toBe(6);
  });
});

/**
 * JobPilot AI — Core Domain Types and Models
 * Enforces Candidate Integrity, Explicit Experience Classification, and Explainable Matching
 */

export type EmploymentCategory = 
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'CO_OP'
  | 'RESEARCH_ASSISTANT'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'ACADEMIC_PROJECT';

export type CompensationType = 'PAID' | 'UNPAID' | 'STIPEND' | 'ACADEMIC_CREDIT' | 'UNKNOWN';

export type WorkArrangement = 'REMOTE' | 'HYBRID' | 'ON_SITE';

export type SkillCategory = 
  | 'PROGRAMMING_LANGUAGE'
  | 'FRAMEWORK'
  | 'DATABASE'
  | 'CLOUD_INFRA'
  | 'TOOL'
  | 'METHODOLOGY'
  | 'SOFT_SKILL';

export interface CandidateContact {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
  isVerified: boolean;
}

export interface CandidateExperience {
  id: string;
  employer: string;
  jobTitle: string;
  category: EmploymentCategory;
  compensationType: CompensationType;
  startDate: string; // ISO date string YYYY-MM
  endDate?: string;   // ISO date string YYYY-MM or null if current
  isCurrent: boolean;
  durationMonths: number;
  location?: string;
  workArrangement?: WorkArrangement;
  responsibilities: string[];
  skillsDemonstrated: string[];
  isVerified: boolean;
  notes?: string;
}

export interface CandidateProject {
  id: string;
  title: string;
  role?: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
  isVerified: boolean;
}

export interface CandidateSkill {
  id: string;
  name: string;
  category: SkillCategory;
  yearsExperience?: number;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  sourceReferences: string[]; // references experienceId, educationId, or projectId
  isVerified: boolean;
}

export interface CandidatePreferences {
  targetRoles: string[];
  preferredLocations: string[];
  preferredArrangements: WorkArrangement[];
  preferredEmploymentTypes: EmploymentCategory[];
  minSalary?: number;
  targetSalary?: number;
  currency: string;
  requiresSponsorship: boolean;
  excludedCompanies: string[];
  minimumMatchScore: number;
  industries?: string[];
}

export interface MasterResume {
  id: string;
  userId: string;
  fileName: string;
  rawText: string;
  checksum: string;
  contact: CandidateContact;
  summary?: string;
  educations: CandidateEducation[];
  experiences: CandidateExperience[];
  projects: CandidateProject[];
  skills: CandidateSkill[];
  certifications: string[];
  languages: string[];
  isImmutable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceCalculation {
  totalRelevantMonths: number;
  fullTimeMonths: number;
  internshipMonths: number;
  coOpMonths: number;
  academicMonths: number;
  explanation: string[];
}

export type JobSourceType = 'GREENHOUSE' | 'LEVER' | 'REMOTIVE' | 'CUSTOM_URL' | 'CSV_IMPORT' | 'MANUAL';

export interface JobPosting {
  id: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentCategory;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceMonths?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  source: JobSourceType;
  sourceUrl: string;
  applicationUrl: string;
  status: 'ACTIVE' | 'EXPIRED' | 'UNVERIFIED';
  postedAt?: string;
  discoveredAt: string;
  lastVerifiedAt: string;
}

export interface JobMatchBreakdown {
  score: number; // 0-100 normalized
  skillAlignmentScore: number;
  experienceAlignmentScore: number;
  titleAlignmentScore: number;
  preferenceAlignmentScore: number;
  matchingSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  experienceGapMonths: number;
  isEligible: boolean;
  criticalGaps: string[];
  explanation: string;
}

export type ApplicationStatus = 
  | 'DISCOVERED'
  | 'SHORTLISTED'
  | 'NOT_A_FIT'
  | 'SAVED'
  | 'TAILORING'
  | 'READY_TO_APPLY'
  | 'APPLIED'
  | 'CONFIRMATION_RECEIVED'
  | 'RECRUITER_CONTACT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED';

export interface ClaimProvenance {
  bulletText: string;
  sourceFactId?: string; // id of master experience/project/education
  sourceSnippet?: string;
  status: 'VERIFIED' | 'SUPPORTED_WITH_REPHRASING' | 'UNSUPPORTED_FLAGGED';
  integrityFlagReason?: string;
}

export interface TailoredResume {
  id: string;
  applicationId: string;
  masterResumeId: string;
  targetJobTitle: string;
  targetCompany: string;
  summary: string;
  provenanceMap: ClaimProvenance[];
  tailoredExperiences: {
    experienceId: string;
    jobTitle: string;
    employer: string;
    bullets: {
      originalText: string;
      tailoredText: string;
      provenance: ClaimProvenance;
      actionVerbEmphasized: string;
    }[];
  }[];
  tailoredProjects: {
    projectId: string;
    title: string;
    bullets: {
      originalText: string;
      tailoredText: string;
      provenance: ClaimProvenance;
    }[];
  }[];
  highlightedSkills: string[];
  reportedSkillGaps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  applicationId: string;
  content: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  groundedFacts: string[];
  createdAt: string;
}

export interface ApplicationActivity {
  id: string;
  applicationId: string;
  timestamp: string;
  type: 
    | 'STATUS_CHANGE'
    | 'RESUME_TAILORED'
    | 'COVER_LETTER_GENERATED'
    | 'APPLIED'
    | 'EMAIL_RECEIVED'
    | 'NOTE_ADDED'
    | 'FOLLOW_UP_SCHEDULED';
  description: string;
  metadata?: Record<string, any>;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job: JobPosting;
  status: ApplicationStatus;
  matchScore: JobMatchBreakdown;
  tailoredResumeId?: string;
  coverLetterId?: string;
  appliedAt?: string;
  submissionMethod?: 'MANUAL_WEBSITE' | 'ASSISTED_PORTAL' | 'EMAIL';
  submissionEvidence?: string;
  notes: string;
  followUpDate?: string;
  recruiterContact?: {
    name?: string;
    email?: string;
    role?: string;
  };
  activities: ApplicationActivity[];
  createdAt: string;
  updatedAt: string;
}

export type EmailClassificationType = 
  | 'APPLICATION_CONFIRMATION'
  | 'RECRUITER_OUTREACH'
  | 'INTERVIEW_INVITATION'
  | 'REJECTION'
  | 'OFFER'
  | 'UNMATCHED';

export interface ProcessedEmail {
  id: string;
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  dateReceived: string;
  snippet: string;
  classification: EmailClassificationType;
  confidence: number; // 0.0 - 1.0
  matchedCompany?: string;
  matchedJobTitle?: string;
  associatedApplicationId?: string;
  evidence: string[];
  isUserVerified: boolean;
  actionTaken?: string;
}

export interface ScheduledSearchConfig {
  id: string;
  userId: string;
  isEnabled: boolean;
  frequency: 'DAILY' | 'HOURLY_12';
  timeOfDay: string; // HH:mm e.g. "09:00"
  timeZone: string;
  targetTitles: string[];
  keywords: string[];
  locations: string[];
  minMatchScore: number;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface ScheduledSearchRun {
  id: string;
  configId: string;
  executedAt: string;
  jobsDiscovered: number;
  newJobsStored: number;
  highMatchJobsFound: number;
  status: 'SUCCESS' | 'PARTIAL_FAILURE' | 'FAILED';
  sourcesChecked: string[];
  errors?: string[];
  durationMs: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'NEW_JOBS' | 'INTERVIEW_INVITE' | 'FOLLOW_UP_DUE' | 'EMAIL_CLASSIFIED' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface JobQueryOptions {
  query?: string;
  location?: string;
  department?: string;
  limit?: number;
}


/**
 * JobPilot AI — State & Repository Store
 * Provides seamless local persistent storage out-of-the-box, with full schema parity for Supabase PostgreSQL.
 * Seeded with authentic initial data so the application is immediately testable and demonstrable.
 */

import {
  Application,
  AppNotification,
  CandidatePreferences,
  JobPosting,
  MasterResume,
  ProcessedEmail,
  ScheduledSearchConfig,
  ScheduledSearchRun,
  TailoredResume,
  CoverLetter,
} from '@/types';
import { RelevanceScorer } from '../scoring/relevance-scorer';

export interface AppState {
  masterResume: MasterResume | null;
  preferences: CandidatePreferences;
  jobs: JobPosting[];
  applications: Application[];
  tailoredResumes: Record<string, TailoredResume>; // keyed by tailoredResumeId
  coverLetters: Record<string, CoverLetter>;       // keyed by coverLetterId
  processedEmails: ProcessedEmail[];
  scheduledSearchConfig: ScheduledSearchConfig;
  scheduledSearchRuns: ScheduledSearchRun[];
  notifications: AppNotification[];
}

// Initial realistic candidate profile for instant local exploration
export const DEFAULT_MASTER_RESUME: MasterResume = {
  id: 'master_res_001',
  userId: 'user_001',
  fileName: 'Alex_Chen_Master_Resume.pdf',
  rawText: `Alex Chen
alex.chen@example.com | (555) 382-9102 | San Francisco, CA | https://linkedin.com/in/alexchen-dev | https://github.com/alexchen-dev

PROFESSIONAL SUMMARY
Full-stack software engineer with 3+ years of combined experience in TypeScript, React, Next.js, and Node.js backend systems. Demonstrated track record of optimizing application performance and architecting resilient microservices.

WORK EXPERIENCE
TechFlow Systems — Full-Stack Software Engineer
Jan 2023 – Present | San Francisco, CA (Hybrid)
• Engineered high-throughput REST and GraphQL microservices in Node.js and TypeScript serving 150,000+ daily active users.
• Architected real-time WebSocket dashboard for transaction monitoring, decreasing telemetry rendering latency by 35%.
• Spearheaded migration from legacy PostgreSQL queries to indexed Prisma ORM schemas, improving p95 query speed by 40%.
• Collaborated in bi-weekly Agile sprints, conducted code reviews, and increased test coverage to 88% using Vitest.

CloudScale Labs — Software Engineering Intern
Jun 2022 – Aug 2022 | Mountain View, CA (On-site)
• Constructed internal developer tooling CLI in TypeScript to automate Docker container builds and Kubernetes manifest generation.
• Integrated AWS S3 upload pipelines with client-side presigned URLs, reducing API server memory overhead by 50%.
• Documented technical specifications and onboarding guides for 20+ incoming engineering interns.

EDUCATION
University of California, Berkeley — Bachelor of Science in Computer Science
Aug 2019 – May 2023 | GPA: 3.82 | Honors: Dean's Honors List (4 Semesters)

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, Go
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS, FastAPI
Databases & Cloud: PostgreSQL, Redis, MongoDB, Docker, Kubernetes, AWS (S3, ECS, Lambda), GCP
Tools & Practices: Git, GitHub Actions, CI/CD, Agile/Scrum, Vitest, REST APIs, GraphQL`,
  checksum: 'e7b1a29938f4019a28',
  contact: {
    fullName: 'Alex Chen',
    email: 'alex.chen@example.com',
    phone: '(555) 382-9102',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexchen-dev',
    githubUrl: 'https://github.com/alexchen-dev',
    portfolioUrl: 'https://alexchen.dev',
  },
  summary:
    'Full-stack software engineer with 3+ years of combined experience in TypeScript, React, Next.js, and Node.js backend systems. Demonstrated track record of optimizing application performance and architecting resilient microservices.',
  educations: [
    {
      id: 'edu_001',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2019-08',
      endDate: '2023-05',
      gpa: '3.82',
      honors: ["Dean's Honors List (4 Semesters)"],
      isVerified: true,
    },
  ],
  experiences: [
    {
      id: 'exp_001',
      employer: 'TechFlow Systems',
      jobTitle: 'Full-Stack Software Engineer',
      category: 'FULL_TIME',
      compensationType: 'PAID',
      startDate: '2023-01',
      endDate: undefined,
      isCurrent: true,
      durationMonths: 22,
      location: 'San Francisco, CA',
      workArrangement: 'HYBRID',
      responsibilities: [
        'Engineered high-throughput REST and GraphQL microservices in Node.js and TypeScript serving 150,000+ daily active users.',
        'Architected real-time WebSocket dashboard for transaction monitoring, decreasing telemetry rendering latency by 35%.',
        'Spearheaded migration from legacy PostgreSQL queries to indexed Prisma ORM schemas, improving p95 query speed by 40%.',
        'Collaborated in bi-weekly Agile sprints, conducted code reviews, and increased test coverage to 88% using Vitest.',
      ],
      skillsDemonstrated: ['TypeScript', 'Node.js', 'React', 'Next.js', 'PostgreSQL', 'GraphQL', 'Docker', 'Vitest'],
      isVerified: true,
    },
    {
      id: 'exp_002',
      employer: 'CloudScale Labs',
      jobTitle: 'Software Engineering Intern',
      category: 'INTERNSHIP',
      compensationType: 'PAID',
      startDate: '2022-06',
      endDate: '2022-08',
      isCurrent: false,
      durationMonths: 3,
      location: 'Mountain View, CA',
      workArrangement: 'ON_SITE',
      responsibilities: [
        'Constructed internal developer tooling CLI in TypeScript to automate Docker container builds and Kubernetes manifest generation.',
        'Integrated AWS S3 upload pipelines with client-side presigned URLs, reducing API server memory overhead by 50%.',
        'Documented technical specifications and onboarding guides for 20+ incoming engineering interns.',
      ],
      skillsDemonstrated: ['TypeScript', 'Docker', 'Kubernetes', 'AWS', 'Node.js'],
      isVerified: true,
    },
  ],
  projects: [
    {
      id: 'proj_001',
      title: 'DevPulse — Developer Metrics & Activity Aggregator',
      role: 'Creator & Lead Developer',
      description: 'Open-source telemetry dashboard that aggregates GitHub pull requests, CI builds, and deployment metrics.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Docker'],
      highlights: [
        'Adopted by 500+ active GitHub repositories with 1.2k GitHub stars.',
        'Implemented OAuth2 GitHub app integration and automated webhook processing.',
      ],
      url: 'https://github.com/alexchen-dev/devpulse',
      isVerified: true,
    },
  ],
  skills: [
    { id: 'sk_1', name: 'TypeScript', category: 'PROGRAMMING_LANGUAGE', isVerified: true, sourceReferences: ['exp_001'] },
    { id: 'sk_2', name: 'React', category: 'FRAMEWORK', isVerified: true, sourceReferences: ['exp_001'] },
    { id: 'sk_3', name: 'Next.js', category: 'FRAMEWORK', isVerified: true, sourceReferences: ['exp_001'] },
    { id: 'sk_4', name: 'Node.js', category: 'FRAMEWORK', isVerified: true, sourceReferences: ['exp_001'] },
    { id: 'sk_5', name: 'PostgreSQL', category: 'DATABASE', isVerified: true, sourceReferences: ['exp_001'] },
    { id: 'sk_6', name: 'Docker', category: 'CLOUD_INFRA', isVerified: true, sourceReferences: ['exp_002'] },
    { id: 'sk_7', name: 'AWS', category: 'CLOUD_INFRA', isVerified: true, sourceReferences: ['exp_002'] },
    { id: 'sk_8', name: 'GraphQL', category: 'METHODOLOGY', isVerified: true, sourceReferences: ['exp_001'] },
    { id: 'sk_9', name: 'Tailwind CSS', category: 'FRAMEWORK', isVerified: true, sourceReferences: ['proj_001'] },
    { id: 'sk_10', name: 'Python', category: 'PROGRAMMING_LANGUAGE', isVerified: true, sourceReferences: ['master_resume_text'] },
  ],
  certifications: ['AWS Certified Solutions Architect – Associate'],
  languages: ['English (Fluent)', 'Mandarin (Conversational)'],
  isImmutable: true,
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-10T10:00:00Z',
};

export const DEFAULT_PREFERENCES: CandidatePreferences = {
  targetRoles: ['Full-Stack Engineer', 'Frontend Engineer', 'Software Engineer'],
  preferredLocations: ['San Francisco, CA', 'Remote', 'New York, NY'],
  preferredArrangements: ['REMOTE', 'HYBRID'],
  preferredEmploymentTypes: ['FULL_TIME'],
  minSalary: 120000,
  targetSalary: 160000,
  currency: 'USD',
  requiresSponsorship: false,
  excludedCompanies: ['CryptoSpam LLC'],
  minimumMatchScore: 70,
  industries: ['Developer Tools', 'SaaS', 'FinTech', 'Cloud Infrastructure'],
};

// Initial realistic jobs for instant exploration
export const DEFAULT_JOBS: JobPosting[] = [
  {
    id: 'gh_stripe_001',
    externalId: '5482910',
    title: 'Software Engineer, Developer Platforms',
    company: 'Stripe',
    location: 'San Francisco, CA',
    workArrangement: 'HYBRID',
    employmentType: 'FULL_TIME',
    description:
      'Stripe is looking for a Software Engineer to design, build, and maintain mission-critical developer tools and public APIs. You will work closely with distributed backend systems in TypeScript, Node.js, and Go, crafting intuitive interfaces for millions of global developers.',
    requiredSkills: ['TypeScript', 'Node.js', 'React', 'REST APIs', 'PostgreSQL'],
    preferredSkills: ['GraphQL', 'Docker', 'AWS', 'CI/CD'],
    minExperienceMonths: 24,
    salaryMin: 145000,
    salaryMax: 185000,
    salaryCurrency: 'USD',
    source: 'GREENHOUSE',
    sourceUrl: 'https://boards.greenhouse.io/stripe/jobs/5482910',
    applicationUrl: 'https://boards.greenhouse.io/stripe/jobs/5482910',
    status: 'ACTIVE',
    postedAt: '2024-10-10T09:00:00Z',
    discoveredAt: '2024-10-12T10:00:00Z',
    lastVerifiedAt: '2024-10-14T08:00:00Z',
  },
  {
    id: 'gh_figma_002',
    externalId: '6102934',
    title: 'Frontend Engineer, Design Systems',
    company: 'Figma',
    location: 'San Francisco, CA',
    workArrangement: 'HYBRID',
    employmentType: 'FULL_TIME',
    description:
      'Figma is building the collaborative interface for the world. We are looking for an experienced Frontend Engineer to build core component libraries in React, TypeScript, and modern CSS, ensuring top-tier accessibility and sub-millisecond interaction responsiveness.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    preferredSkills: ['WebSockets', 'GraphQL', 'Vitest'],
    minExperienceMonths: 24,
    salaryMin: 150000,
    salaryMax: 190000,
    salaryCurrency: 'USD',
    source: 'GREENHOUSE',
    sourceUrl: 'https://boards.greenhouse.io/figma/jobs/6102934',
    applicationUrl: 'https://boards.greenhouse.io/figma/jobs/6102934',
    status: 'ACTIVE',
    postedAt: '2024-10-11T14:30:00Z',
    discoveredAt: '2024-10-12T10:00:00Z',
    lastVerifiedAt: '2024-10-14T08:00:00Z',
  },
  {
    id: 'lever_benchling_003',
    externalId: '7721839',
    title: 'Full Stack Engineer, Workflow Products',
    company: 'Benchling',
    location: 'Remote, US',
    workArrangement: 'REMOTE',
    employmentType: 'FULL_TIME',
    description:
      'Benchling serves scientists transforming modern medicine. In this role, you will build full-stack data modeling and laboratory workflow applications using Python, TypeScript, React, and AWS cloud infrastructure.',
    requiredSkills: ['Python', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
    preferredSkills: ['AWS', 'GraphQL', 'FastAPI'],
    minExperienceMonths: 24,
    salaryMin: 140000,
    salaryMax: 175000,
    salaryCurrency: 'USD',
    source: 'LEVER',
    sourceUrl: 'https://jobs.lever.co/benchling/7721839',
    applicationUrl: 'https://jobs.lever.co/benchling/7721839',
    status: 'ACTIVE',
    postedAt: '2024-10-09T11:00:00Z',
    discoveredAt: '2024-10-12T10:00:00Z',
    lastVerifiedAt: '2024-10-14T08:00:00Z',
  },
  {
    id: 'gh_gitlab_004',
    externalId: '4992182',
    title: 'Senior Backend Engineer, Kubernetes Orchestration',
    company: 'GitLab',
    location: 'Remote',
    workArrangement: 'REMOTE',
    employmentType: 'FULL_TIME',
    description:
      'GitLab is seeking a Senior Backend Engineer to architect cloud-native container execution environments. Requires 5+ years of distributed backend experience with Go, Kubernetes, and massive scale microservices.',
    requiredSkills: ['Go', 'Kubernetes', 'Docker', 'Linux', 'Microservices'],
    preferredSkills: ['GCP', 'PostgreSQL', 'Rust'],
    minExperienceMonths: 60, // Candidate has experience deficit here -> will trigger critical gap!
    salaryMin: 170000,
    salaryMax: 220000,
    salaryCurrency: 'USD',
    source: 'GREENHOUSE',
    sourceUrl: 'https://boards.greenhouse.io/gitlab/jobs/4992182',
    applicationUrl: 'https://boards.greenhouse.io/gitlab/jobs/4992182',
    status: 'ACTIVE',
    postedAt: '2024-10-08T16:00:00Z',
    discoveredAt: '2024-10-12T10:00:00Z',
    lastVerifiedAt: '2024-10-14T08:00:00Z',
  },
];

// Initial realistic applications across pipeline stages
export const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: 'app_001',
    userId: 'user_001',
    jobId: DEFAULT_JOBS[0].id,
    job: DEFAULT_JOBS[0],
    status: 'CONFIRMATION_RECEIVED',
    matchScore: RelevanceScorer.calculateMatch(DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_JOBS[0]),
    appliedAt: '2024-10-12T14:00:00Z',
    submissionMethod: 'ASSISTED_PORTAL',
    submissionEvidence: 'Confirmation email received from careers@stripe.com (msg_001)',
    notes: 'Submitted tailored resume focusing on TypeScript API design and PostgreSQL optimization.',
    followUpDate: '2024-10-19',
    recruiterContact: {
      name: 'Sarah Jenkins',
      email: 'careers@stripe.com',
      role: 'Technical Recruiter',
    },
    activities: [
      {
        id: 'act_1',
        applicationId: 'app_001',
        timestamp: '2024-10-12T13:30:00Z',
        type: 'RESUME_TAILORED',
        description: 'Generated truthful tailored resume highlighting TypeScript, Node.js, and PostgreSQL.',
      },
      {
        id: 'act_2',
        applicationId: 'app_001',
        timestamp: '2024-10-12T14:00:00Z',
        type: 'APPLIED',
        description: 'Application submitted via Stripe Greenhouse portal.',
      },
      {
        id: 'act_3',
        applicationId: 'app_001',
        timestamp: '2024-10-12T14:15:00Z',
        type: 'EMAIL_RECEIVED',
        description: 'Received application confirmation email.',
      },
    ],
    createdAt: '2024-10-12T13:00:00Z',
    updatedAt: '2024-10-12T14:15:00Z',
  },
  {
    id: 'app_002',
    userId: 'user_001',
    jobId: DEFAULT_JOBS[1].id,
    job: DEFAULT_JOBS[1],
    status: 'READY_TO_APPLY',
    matchScore: RelevanceScorer.calculateMatch(DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_JOBS[1]),
    notes: 'Tailored resume generated and verified. Ready for human submission review.',
    activities: [
      {
        id: 'act_4',
        applicationId: 'app_002',
        timestamp: '2024-10-13T10:00:00Z',
        type: 'STATUS_CHANGE',
        description: 'Shortlisted role and created application record.',
      },
      {
        id: 'act_5',
        applicationId: 'app_002',
        timestamp: '2024-10-13T10:30:00Z',
        type: 'RESUME_TAILORED',
        description: 'Tailored resume bullets emphasizing React, Next.js, and Tailwind CSS.',
      },
    ],
    createdAt: '2024-10-13T10:00:00Z',
    updatedAt: '2024-10-13T10:30:00Z',
  },
  {
    id: 'app_003',
    userId: 'user_001',
    jobId: DEFAULT_JOBS[2].id,
    job: DEFAULT_JOBS[2],
    status: 'INTERVIEW',
    matchScore: RelevanceScorer.calculateMatch(DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_JOBS[2]),
    appliedAt: '2024-10-05T11:00:00Z',
    submissionMethod: 'MANUAL_WEBSITE',
    notes: 'Technical screen scheduled with Engineering Manager for Thursday.',
    followUpDate: '2024-10-17',
    recruiterContact: {
      name: 'Marcus Vance',
      email: 'mvance@benchling.com',
      role: 'Staff Technical Recruiter',
    },
    activities: [
      {
        id: 'act_6',
        applicationId: 'app_003',
        timestamp: '2024-10-05T11:00:00Z',
        type: 'APPLIED',
        description: 'Submitted application on Benchling careers page.',
      },
      {
        id: 'act_7',
        applicationId: 'app_003',
        timestamp: '2024-10-10T16:00:00Z',
        type: 'EMAIL_RECEIVED',
        description: 'Received technical screen invitation email from Marcus Vance.',
      },
      {
        id: 'act_8',
        applicationId: 'app_003',
        timestamp: '2024-10-11T09:00:00Z',
        type: 'STATUS_CHANGE',
        description: 'Advanced stage to Interview.',
      },
    ],
    createdAt: '2024-10-05T10:00:00Z',
    updatedAt: '2024-10-11T09:00:00Z',
  },
];

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_001',
    type: 'INTERVIEW_INVITE',
    title: 'Interview Screen with Benchling',
    message: 'Marcus Vance from Benchling invited you to an initial technical screen.',
    link: '/app/applications/app_003',
    isRead: false,
    createdAt: '2024-10-10T16:00:00Z',
  },
  {
    id: 'notif_2',
    userId: 'user_001',
    type: 'NEW_JOBS',
    title: 'High-Match Job Discovered (92%)',
    message: 'Stripe posted "Software Engineer, Developer Platforms" matching 5 of your primary skills.',
    link: '/app/jobs/gh_stripe_001',
    isRead: false,
    createdAt: '2024-10-12T10:00:00Z',
  },
  {
    id: 'notif_3',
    userId: 'user_001',
    type: 'FOLLOW_UP_DUE',
    title: 'Follow-up Due: Stripe Application',
    message: 'It has been 7 days since submitting your application to Stripe. Consider checking in.',
    link: '/app/applications/app_001',
    isRead: true,
    createdAt: '2024-10-13T09:00:00Z',
  },
];

export const DEFAULT_SCHEDULED_CONFIG: ScheduledSearchConfig = {
  id: 'sched_001',
  userId: 'user_001',
  isEnabled: true,
  frequency: 'DAILY',
  timeOfDay: '09:00',
  timeZone: 'America/Los_Angeles',
  targetTitles: ['Full-Stack Engineer', 'Frontend Engineer', 'Software Engineer'],
  keywords: ['TypeScript', 'Next.js', 'React'],
  locations: ['San Francisco, CA', 'Remote'],
  minMatchScore: 75,
  lastRunAt: '2024-10-14T09:00:00Z',
  nextRunAt: '2024-10-15T09:00:00Z',
};

export const DEFAULT_SCHEDULED_RUNS: ScheduledSearchRun[] = [
  {
    id: 'run_001',
    configId: 'sched_001',
    executedAt: '2024-10-14T09:00:00Z',
    jobsDiscovered: 42,
    newJobsStored: 4,
    highMatchJobsFound: 2,
    status: 'SUCCESS',
    sourcesChecked: ['Greenhouse Boards', 'Lever Postings'],
    errors: [],
    durationMs: 1420,
  },
];

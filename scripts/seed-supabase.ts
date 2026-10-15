/**
 * JobPilot AI — Supabase Database Seeding Script
 * Run with: npx ts-node scripts/seed-supabase.ts (or via tsx)
 */

import { createClient } from '@supabase/supabase-js';
import { DEFAULT_JOBS, DEFAULT_MASTER_RESUME } from '../src/lib/store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function seed() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.');
    process.exit(1);
  }

  console.log(`Connecting to Supabase at ${supabaseUrl}...`);
  const client = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Seed Jobs
  console.log(`Seeding ${DEFAULT_JOBS.length} default job postings...`);
  const jobPayload = DEFAULT_JOBS.map((j) => ({
    id: j.id,
    external_id: j.externalId,
    title: j.title,
    company: j.company,
    location: j.location,
    work_arrangement: j.workArrangement,
    employment_type: j.employmentType,
    description: j.description,
    required_skills: j.requiredSkills,
    preferred_skills: j.preferredSkills,
    min_experience_months: j.minExperienceMonths || 0,
    source: j.source,
    source_url: j.sourceUrl,
    application_url: j.applicationUrl,
    status: j.status,
  }));

  const { error: jobsError } = await client.from('jobs').upsert(jobPayload, { onConflict: 'source,external_id' });
  if (jobsError) {
    console.error('Failed to seed jobs:', jobsError.message);
  } else {
    console.log('✓ Successfully seeded jobs.');
  }

  // 2. Seed Master Resume
  console.log('Seeding default candidate master resume...');
  const { error: resumeError } = await client.from('master_resumes').upsert({
    id: DEFAULT_MASTER_RESUME.id,
    user_id: DEFAULT_MASTER_RESUME.userId,
    file_name: DEFAULT_MASTER_RESUME.fileName,
    raw_text: DEFAULT_MASTER_RESUME.rawText,
    checksum: DEFAULT_MASTER_RESUME.checksum,
    is_immutable: DEFAULT_MASTER_RESUME.isImmutable,
    contact_info: DEFAULT_MASTER_RESUME.contact,
    summary: DEFAULT_MASTER_RESUME.summary,
    educations: DEFAULT_MASTER_RESUME.educations,
    experiences: DEFAULT_MASTER_RESUME.experiences,
    skills: DEFAULT_MASTER_RESUME.skills,
    projects: DEFAULT_MASTER_RESUME.projects,
  });

  if (resumeError) {
    console.error('Failed to seed master resume:', resumeError.message);
  } else {
    console.log('✓ Successfully seeded master resume.');
  }

  console.log('Database seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Unexpected seeding failure:', err);
  process.exit(1);
});

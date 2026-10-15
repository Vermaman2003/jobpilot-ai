/**
 * JobPilot AI — Supabase PostgreSQL Data Layer
 * Provides hosted database integration with Row-Level Security (RLS)
 * and seamless fallback to local persistent storage when unconfigured.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Application,
  JobPosting,
  MasterResume,
  CandidatePreferences,
  AppNotification,
  ScheduledSearchConfig,
} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let clientInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project') &&
      !supabaseAnonKey.includes('your-anon-key')
  );
};

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance && supabaseUrl && supabaseAnonKey) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
};

export class SupabaseService {
  /**
   * Test database connectivity to Supabase
   */
  public static async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = getSupabase();
    if (!client) {
      return {
        success: false,
        message: 'Supabase credentials are not configured in environment variables.',
      };
    }

    try {
      const { data, error } = await client.from('jobs').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return {
        success: true,
        message: 'Connected to Supabase PostgreSQL database successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to query Supabase database.',
      };
    }
  }

  /**
   * Synchronize Master Resume to Supabase
   */
  public static async saveMasterResume(resume: MasterResume): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;

    try {
      const { error } = await client.from('master_resumes').upsert({
        id: resume.id,
        user_id: resume.userId,
        file_name: resume.fileName,
        raw_text: resume.rawText,
        checksum: resume.checksum,
        is_immutable: resume.isImmutable,
        contact_info: resume.contact,
        summary: resume.summary,
        educations: resume.educations,
        experiences: resume.experiences,
        skills: resume.skills,
        projects: resume.projects,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch (err) {
      console.warn('Failed to save master resume to Supabase:', err);
      return false;
    }
  }

  /**
   * Synchronize Job Postings to Supabase
   */
  public static async saveJobs(jobs: JobPosting[]): Promise<boolean> {
    const client = getSupabase();
    if (!client || jobs.length === 0) return false;

    try {
      const records = jobs.map((j) => ({
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

      const { error } = await client.from('jobs').upsert(records, { onConflict: 'source,external_id' });
      return !error;
    } catch (err) {
      console.warn('Failed to sync jobs to Supabase:', err);
      return false;
    }
  }

  /**
   * Synchronize Application records to Supabase
   */
  public static async saveApplication(app: Application): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;

    try {
      const { error } = await client.from('applications').upsert({
        id: app.id,
        user_id: app.userId,
        job_id: app.jobId,
        status: app.status,
        match_score: app.matchScore.score,
        match_breakdown: app.matchScore,
        notes: app.notes,
        follow_up_date: app.followUpDate,
        applied_at: app.appliedAt,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch (err) {
      console.warn('Failed to sync application to Supabase:', err);
      return false;
    }
  }
}

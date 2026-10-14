/**
 * JobPilot AI — Lever Public Postings Adapter
 * Queries authorized public postings directly from Lever Postings API
 */

import { JobPosting, WorkArrangement, EmploymentCategory } from '@/types';
import { JobQueryOptions, JobSourceAdapter } from '../types';

export class LeverAdapter implements JobSourceAdapter {
  public sourceName = 'LEVER' as const;

  private detectWorkArrangement(location: string, title: string, workplaceType?: string): WorkArrangement {
    const text = `${location} ${title} ${workplaceType || ''}`.toLowerCase();
    if (text.includes('remote')) return 'REMOTE';
    if (text.includes('hybrid')) return 'HYBRID';
    return 'ON_SITE';
  }

  private detectEmploymentCategory(commitment?: string, title?: string): EmploymentCategory {
    const text = `${commitment || ''} ${title || ''}`.toLowerCase();
    if (text.includes('intern')) return 'INTERNSHIP';
    if (text.includes('contract')) return 'CONTRACT';
    if (text.includes('part-time') || text.includes('part time')) return 'PART_TIME';
    return 'FULL_TIME';
  }

  private extractSkillKeywords(text: string): string[] {
    const commonSkills = [
      'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'React', 'Next.js', 'Node.js',
      'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'GraphQL', 'REST', 'Tailwind',
      'CI/CD', 'Git', 'Linux', 'Microservices', 'SQL', 'NoSQL', 'MongoDB', 'Redis'
    ];

    const found: string[] = [];
    const lower = text.toLowerCase();
    for (const skill of commonSkills) {
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (skillRegex.test(lower)) {
        found.push(skill);
      }
    }
    return found;
  }

  public async fetchJobs(company: string, options?: JobQueryOptions): Promise<JobPosting[]> {
    const cleanCompany = company.trim().toLowerCase();
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(cleanCompany)}?mode=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'JobPilot-AI-Discovery/1.0' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Lever API returned ${response.status}: ${response.statusText}`);
      }

      const rawJobs = (await response.json()) as any[];
      if (!Array.isArray(rawJobs)) return [];

      const limit = options?.limit || 50;
      const normalizedJobs: JobPosting[] = [];

      for (const raw of rawJobs.slice(0, limit)) {
        const title = raw.text || 'Untitled Role';
        const location = raw.categories?.location || 'Unspecified';
        const commitment = raw.categories?.commitment || '';
        const workplaceType = raw.workplaceType || '';
        const description = raw.descriptionPlain || raw.description || '';

        const arrangement = this.detectWorkArrangement(location, title, workplaceType);
        const empCategory = this.detectEmploymentCategory(commitment, title);
        const skills = this.extractSkillKeywords(description);

        if (options?.query) {
          const q = options.query.toLowerCase();
          if (!title.toLowerCase().includes(q) && !description.toLowerCase().includes(q)) {
            continue;
          }
        }

        const postedDate = raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString();

        normalizedJobs.push({
          id: `lever_${cleanCompany}_${raw.id}`,
          externalId: String(raw.id),
          title,
          company: cleanCompany.charAt(0).toUpperCase() + cleanCompany.slice(1),
          location,
          workArrangement: arrangement,
          employmentType: empCategory,
          description: description.slice(0, 5000),
          requiredSkills: skills.slice(0, 8),
          preferredSkills: skills.slice(8, 14),
          minExperienceMonths: empCategory === 'INTERNSHIP' ? 0 : title.toLowerCase().includes('senior') ? 48 : 24,
          source: 'LEVER',
          sourceUrl: raw.hostedUrl || `https://jobs.lever.co/${cleanCompany}/${raw.id}`,
          applicationUrl: raw.applyUrl || raw.hostedUrl || `https://jobs.lever.co/${cleanCompany}/${raw.id}`,
          status: 'ACTIVE',
          postedAt: postedDate,
          discoveredAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
        });
      }

      return normalizedJobs;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Lever request timed out after 8 seconds.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async testConnection(company: string): Promise<boolean> {
    try {
      const jobs = await this.fetchJobs(company, { limit: 1 });
      return jobs.length >= 0;
    } catch {
      return false;
    }
  }
}

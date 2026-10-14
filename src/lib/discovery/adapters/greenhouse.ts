/**
 * JobPilot AI — Greenhouse Public Board Adapter
 * Fetches authorized public postings directly from Greenhouse Boards API
 */

import { JobPosting, WorkArrangement, EmploymentCategory } from '@/types';
import { JobQueryOptions, JobSourceAdapter } from '../types';

export class GreenhouseAdapter implements JobSourceAdapter {
  public sourceName = 'GREENHOUSE' as const;

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectWorkArrangement(location: string, title: string, content: string): WorkArrangement {
    const text = `${location} ${title} ${content}`.toLowerCase();
    if (text.includes('remote') || text.includes('work from anywhere') || text.includes('anywhere')) {
      return 'REMOTE';
    }
    if (text.includes('hybrid')) {
      return 'HYBRID';
    }
    return 'ON_SITE';
  }

  private detectEmploymentCategory(title: string, content: string): EmploymentCategory {
    const text = `${title} ${content}`.toLowerCase();
    if (text.includes('intern') || text.includes('internship')) return 'INTERNSHIP';
    if (text.includes('co-op') || text.includes('coop')) return 'CO_OP';
    if (text.includes('contract') || text.includes('temporary')) return 'CONTRACT';
    if (text.includes('part-time') || text.includes('part time')) return 'PART_TIME';
    return 'FULL_TIME';
  }

  private extractSkillKeywords(text: string): string[] {
    const commonSkills = [
      'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
      'React', 'Next.js', 'Node.js', 'Vue', 'Angular', 'Express', 'Django', 'FastAPI', 'Spring Boot',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'Docker', 'Kubernetes', 'AWS', 'GCP',
      'Azure', 'CI/CD', 'Git', 'Linux', 'Microservices', 'Tailwind', 'SQL', 'NoSQL'
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

  public async fetchJobs(boardToken: string, options?: JobQueryOptions): Promise<JobPosting[]> {
    const cleanToken = boardToken.trim().toLowerCase();
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(cleanToken)}/jobs?content=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'JobPilot-AI-Discovery/1.0' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Greenhouse API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.jobs || !Array.isArray(data.jobs)) {
        return [];
      }

      const rawJobs = data.jobs as any[];
      const limit = options?.limit || 50;
      const normalizedJobs: JobPosting[] = [];

      for (const raw of rawJobs.slice(0, limit)) {
        const rawContent = raw.content || '';
        const plainText = this.stripHtml(rawContent);
        const title = raw.title || 'Untitled Role';
        const locationName = raw.location?.name || 'Unspecified';
        const arrangement = this.detectWorkArrangement(locationName, title, plainText);
        const empCategory = this.detectEmploymentCategory(title, plainText);
        const detectedSkills = this.extractSkillKeywords(plainText);

        // Filter by search query if specified
        if (options?.query) {
          const q = options.query.toLowerCase();
          if (!title.toLowerCase().includes(q) && !plainText.toLowerCase().includes(q)) {
            continue;
          }
        }

        normalizedJobs.push({
          id: `gh_${cleanToken}_${raw.id}`,
          externalId: String(raw.id),
          title,
          company: cleanToken.charAt(0).toUpperCase() + cleanToken.slice(1),
          location: locationName,
          workArrangement: arrangement,
          employmentType: empCategory,
          description: plainText.slice(0, 5000), // safe bounded length
          requiredSkills: detectedSkills.slice(0, 8),
          preferredSkills: detectedSkills.slice(8, 14),
          minExperienceMonths: empCategory === 'INTERNSHIP' ? 0 : title.toLowerCase().includes('senior') ? 48 : 24,
          source: 'GREENHOUSE',
          sourceUrl: raw.absolute_url || `https://boards.greenhouse.io/${cleanToken}/jobs/${raw.id}`,
          applicationUrl: raw.absolute_url || `https://boards.greenhouse.io/${cleanToken}/jobs/${raw.id}`,
          status: 'ACTIVE',
          postedAt: raw.updated_at || new Date().toISOString(),
          discoveredAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
        });
      }

      return normalizedJobs;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Greenhouse request timed out after 8 seconds.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async testConnection(boardToken: string): Promise<boolean> {
    try {
      const jobs = await this.fetchJobs(boardToken, { limit: 1 });
      return jobs.length >= 0;
    } catch {
      return false;
    }
  }
}

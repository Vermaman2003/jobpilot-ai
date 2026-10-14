/**
 * JobPilot AI — CSV Job Import Adapter
 * Allows users to bulk-import job listings safely from spreadsheets
 */

import { JobPosting, WorkArrangement, EmploymentCategory } from '@/types';

export interface CsvJobRow {
  title: string;
  company: string;
  location?: string;
  url?: string;
  description?: string;
  skills?: string;
  employmentType?: string;
  workArrangement?: string;
}

export class CsvJobAdapter {
  /**
   * Parse a raw CSV text string into validated JobPosting objects.
   */
  public static parseCsv(csvText: string): JobPosting[] {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('role') || h.includes('position'));
    const companyIdx = headers.findIndex((h) => h.includes('company') || h.includes('employer'));
    const locationIdx = headers.findIndex((h) => h.includes('location') || h.includes('city'));
    const urlIdx = headers.findIndex((h) => h.includes('url') || h.includes('link'));
    const descIdx = headers.findIndex((h) => h.includes('description') || h.includes('details') || h.includes('summary'));
    const skillsIdx = headers.findIndex((h) => h.includes('skill') || h.includes('requirement'));
    const arrangementIdx = headers.findIndex((h) => h.includes('arrangement') || h.includes('remote'));

    if (titleIdx === -1 || companyIdx === -1) {
      throw new Error('CSV must contain at least "Title" and "Company" columns.');
    }

    const jobs: JobPosting[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Split preserving quotes
      const row = this.parseCsvRow(lines[i]);
      if (row.length <= Math.max(titleIdx, companyIdx)) continue;

      const title = row[titleIdx]?.trim();
      const company = row[companyIdx]?.trim();
      if (!title || !company) continue;

      const location = locationIdx !== -1 && row[locationIdx] ? row[locationIdx].trim() : 'Unspecified';
      const url = urlIdx !== -1 && row[urlIdx] ? row[urlIdx].trim() : '';
      const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : `Job opportunity for ${title} at ${company}.`;
      
      const skillsRaw = skillsIdx !== -1 && row[skillsIdx] ? row[skillsIdx] : '';
      const skills = skillsRaw
        .split(/[;,|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);

      let arrangement: WorkArrangement = 'ON_SITE';
      if (arrangementIdx !== -1 && row[arrangementIdx]) {
        const arrStr = row[arrangementIdx].toLowerCase();
        if (arrStr.includes('remote')) arrangement = 'REMOTE';
        else if (arrStr.includes('hybrid')) arrangement = 'HYBRID';
      }

      const id = `csv_${Date.now()}_${i}`;

      jobs.push({
        id,
        externalId: id,
        title,
        company,
        location,
        workArrangement: arrangement,
        employmentType: 'FULL_TIME',
        description,
        requiredSkills: skills.slice(0, 8),
        preferredSkills: skills.slice(8, 14),
        minExperienceMonths: title.toLowerCase().includes('senior') ? 48 : 24,
        source: 'CSV_IMPORT',
        sourceUrl: url || '#',
        applicationUrl: url || '#',
        status: 'ACTIVE',
        postedAt: new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
      });
    }

    return jobs;
  }

  private static parseCsvRow(rowStr: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    return fields;
  }
}

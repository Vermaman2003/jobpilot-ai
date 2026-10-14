import { describe, it, expect } from 'vitest';
import { ResumeExporter } from '@/lib/export/resume-exporter';
import { DEFAULT_MASTER_RESUME } from '@/lib/store';
import { TailoringService } from '@/lib/tailoring/tailor-service';
import { RelevanceScorer } from '@/lib/scoring/relevance-scorer';
import { DEFAULT_PREFERENCES, DEFAULT_JOBS } from '@/lib/store';

describe('ResumeExporter', () => {
  it('generates a valid DOCX Uint8Array buffer from master resume', async () => {
    const docxBuffer = await ResumeExporter.generateDocx(DEFAULT_MASTER_RESUME);
    expect(docxBuffer).toBeDefined();
    expect(docxBuffer instanceof Uint8Array).toBe(true);
    expect(docxBuffer.byteLength).toBeGreaterThan(1000);
  });

  it('generates a valid selectable-text ATS PDF buffer from master resume', () => {
    const pdfBuffer = ResumeExporter.generatePdf(DEFAULT_MASTER_RESUME);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer instanceof Uint8Array).toBe(true);
    expect(pdfBuffer.byteLength).toBeGreaterThan(1000);

    // Verify PDF header magic bytes "%PDF-"
    const header = String.fromCharCode(...pdfBuffer.slice(0, 5));
    expect(header).toBe('%PDF-');
  });

  it('exports tailored resume with provenance-verified bullets and technical skills', async () => {
    const job = DEFAULT_JOBS[0];
    const match = RelevanceScorer.calculateMatch(DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, job);
    const tailored = await TailoringService.tailorResume(DEFAULT_MASTER_RESUME, job, match, 'app_test');

    const docxTailored = await ResumeExporter.generateDocx(DEFAULT_MASTER_RESUME, tailored);
    expect(docxTailored.byteLength).toBeGreaterThan(1000);

    const pdfTailored = ResumeExporter.generatePdf(DEFAULT_MASTER_RESUME, tailored);
    expect(pdfTailored.byteLength).toBeGreaterThan(1000);
    const header = String.fromCharCode(...pdfTailored.slice(0, 5));
    expect(header).toBe('%PDF-');
  });
});

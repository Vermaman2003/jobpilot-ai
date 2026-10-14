import { describe, it, expect } from 'vitest';
import { ClaimProvenanceEngine } from '@/lib/integrity/claim-provenance';
import { DEFAULT_MASTER_RESUME } from '@/lib/store';

describe('ClaimProvenanceEngine', () => {
  const masterResume = DEFAULT_MASTER_RESUME;

  it('verifies tailored bullet with strong overlap and authentic metrics', () => {
    const original = 'Architected responsive UI components using Next.js and TypeScript, reducing client latency by 35%.';
    const tailored = 'Engineered responsive UI components utilizing Next.js and TypeScript, reducing client latency by 35%.';

    const result = ClaimProvenanceEngine.verifyBulletProvenance(
      tailored,
      original,
      'exp_1_bullet_0',
      masterResume
    );

    expect(result.status).toBe('VERIFIED');
    expect(result.integrityFlagReason).toBeUndefined();
  });

  it('detects ungrounded invented metrics and flags them', () => {
    const original = 'Architected responsive UI components using Next.js and TypeScript.';
    // Candidate/AI invents "increasing conversion by 85%"
    const tailored = 'Architected responsive UI components using Next.js and TypeScript, increasing conversion by 85%.';

    const result = ClaimProvenanceEngine.verifyBulletProvenance(
      tailored,
      original,
      'exp_1_bullet_0',
      masterResume
    );

    expect(result.status).toBe('UNSUPPORTED_FLAGGED');
    expect(result.integrityFlagReason).toContain('Ungrounded metric detected');
  });

  it('detects ungrounded skills not present in master resume', () => {
    const original = 'Designed backend microservices and REST APIs.';
    // Injected brand new tech "cockroachdb" that isn't anywhere in master resume
    const tailored = 'Designed backend microservices and REST APIs utilizing cockroachdb.';

    const result = ClaimProvenanceEngine.verifyBulletProvenance(
      tailored,
      original,
      'exp_1_bullet_0',
      masterResume
    );

    expect(result.status).toBe('UNSUPPORTED_FLAGGED');
    expect(result.integrityFlagReason).toContain('ungrounded skill');
  });

  it('flags claims with very low semantic overlap', () => {
    const original = 'Built frontend components with React.';
    const tailored = 'Led enterprise digital transformation initiatives across 5 business units.';

    const result = ClaimProvenanceEngine.verifyBulletProvenance(
      tailored,
      original,
      'exp_1_bullet_0',
      masterResume
    );

    expect(result.status).toBe('UNSUPPORTED_FLAGGED');
  });

  it('audits tailored resume claims and produces summary', () => {
    const auditValid = ClaimProvenanceEngine.auditTailoredResume([
      {
        bulletText: 'Sample bullet',
        status: 'VERIFIED',
      },
      {
        bulletText: 'Sample bullet 2',
        status: 'SUPPORTED_WITH_REPHRASING',
      },
    ]);
    expect(auditValid.isValid).toBe(true);
    expect(auditValid.flaggedCount).toBe(0);

    const auditInvalid = ClaimProvenanceEngine.auditTailoredResume([
      {
        bulletText: 'Sample bullet',
        status: 'VERIFIED',
      },
      {
        bulletText: 'Sample bullet 2',
        status: 'UNSUPPORTED_FLAGGED',
        integrityFlagReason: 'Invented metric',
      },
    ]);
    expect(auditInvalid.isValid).toBe(false);
    expect(auditInvalid.flaggedCount).toBe(1);
  });
});

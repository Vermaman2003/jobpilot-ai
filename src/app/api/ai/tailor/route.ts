import { NextRequest, NextResponse } from 'next/server';
import { AiServiceManager } from '@/lib/ai/ai-provider';
import { ClaimProvenanceEngine } from '@/lib/integrity/claim-provenance';
import { MasterResume } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originalBullet,
      targetSkills = [],
      jobTitle = 'Software Engineer',
      company = 'Company',
      factId = 'fact_1',
      masterResume,
      apiKey,
      providerType,
    } = body;

    if (!originalBullet) {
      return NextResponse.json(
        { success: false, error: 'originalBullet is required.' },
        { status: 400 }
      );
    }

    const provider = AiServiceManager.getProvider(apiKey, providerType);
    const { tailoredText, actionVerb } = await provider.tailorBullet(
      originalBullet,
      targetSkills,
      { title: jobTitle, company }
    );

    // Strict Provenance Safeguard
    let provenance;
    if (masterResume) {
      provenance = ClaimProvenanceEngine.verifyBulletProvenance(
        tailoredText,
        originalBullet,
        factId,
        masterResume as MasterResume
      );
    } else {
      provenance = {
        bulletText: tailoredText,
        sourceFactId: factId,
        sourceSnippet: originalBullet,
        status: 'SUPPORTED_WITH_REPHRASING',
      };
    }

    return NextResponse.json({
      success: true,
      tailoredText,
      actionVerb,
      provenance,
      providerUsed: provider.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error tailoring bullet.' },
      { status: 500 }
    );
  }
}

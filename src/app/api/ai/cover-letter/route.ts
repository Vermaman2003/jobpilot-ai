import { NextRequest, NextResponse } from 'next/server';
import { AiServiceManager } from '@/lib/ai/ai-provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      candidateName,
      contactInfo,
      jobTitle,
      company,
      topSkills = [],
      relevantExperienceSnippet = '',
      apiKey,
      providerType,
    } = body;

    if (!candidateName || !company || !jobTitle) {
      return NextResponse.json(
        { success: false, error: 'candidateName, company, and jobTitle are required.' },
        { status: 400 }
      );
    }

    const provider = AiServiceManager.getProvider(apiKey, providerType);
    const content = await provider.generateCoverLetter({
      candidateName,
      contactInfo: contactInfo || '',
      jobTitle,
      company,
      topSkills,
      relevantExperienceSnippet,
    });

    return NextResponse.json({
      success: true,
      content,
      providerUsed: provider.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error generating cover letter.' },
      { status: 500 }
    );
  }
}

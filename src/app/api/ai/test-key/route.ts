import { NextRequest, NextResponse } from 'next/server';
import { GeminiAiProvider } from '@/lib/ai/ai-provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey;

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json(
        { success: false, message: 'No API key provided.' },
        { status: 400 }
      );
    }

    const provider = new GeminiAiProvider(apiKey);
    const result = await provider.testConnection();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error testing Gemini API key.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService, isSupabaseConfigured } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Supabase credentials are not set. The platform is running securely on offline local storage.',
    });
  }

  const result = await SupabaseService.testConnection();
  return NextResponse.json({
    configured: true,
    ...result,
  });
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/app/inbox?error=' + encodeURIComponent(error), req.url));
  }

  // In production with real Google OAuth client credentials, exchange code for tokens:
  // const tokens = await oauth2Client.getToken(code);
  // Store encrypted tokens in database...

  // Redirect back to the inbox with successful connection flag
  return NextResponse.redirect(new URL('/app/inbox?connected=true', req.url));
}

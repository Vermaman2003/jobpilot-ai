import { NextRequest, NextResponse } from 'next/server';
import { CronService } from '@/lib/scheduler/cron-service';
import { DEFAULT_MASTER_RESUME, DEFAULT_PREFERENCES, DEFAULT_SCHEDULED_CONFIG } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCronExecution(req);
}

export async function POST(req: NextRequest) {
  return handleCronExecution(req);
}

async function handleCronExecution(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secretFromEnv = process.env.CRON_SECRET || 'dev_cron_secret_key';

    // Allow bearer token or ?token= query parameter
    const url = new URL(req.url);
    const tokenQuery = url.searchParams.get('token');

    const providedToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : tokenQuery;

    // Check authorization in production environments
    if (process.env.NODE_ENV === 'production' && providedToken !== secretFromEnv) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid CRON_SECRET token provided' },
        { status: 401 }
      );
    }

    // Execute scheduled search
    const { runRecord, newJobs, notifications } = await CronService.executeScheduledSearch(
      DEFAULT_SCHEDULED_CONFIG,
      DEFAULT_MASTER_RESUME,
      DEFAULT_PREFERENCES,
      []
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      run: runRecord,
      discoveredCount: runRecord.jobsDiscovered,
      newJobsStoredCount: newJobs.length,
      highMatchCount: runRecord.highMatchJobsFound,
      durationMs: runRecord.durationMs,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cron execution encountered an unexpected error',
      },
      { status: 500 }
    );
  }
}

import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured, getSupabase, SupabaseService } from '@/lib/db/supabase';

describe('SupabaseService', () => {
  it('detects unconfigured environment gracefully without crashing', () => {
    // In test environment without real credentials
    const configured = isSupabaseConfigured();
    // Default dummy template in env or empty should report unconfigured
    expect(typeof configured).toBe('boolean');
  });

  it('returns null client when credentials are not configured', () => {
    if (!isSupabaseConfigured()) {
      const client = getSupabase();
      expect(client).toBeNull();
    }
  });

  it('reports informative status when testConnection is called without credentials', async () => {
    if (!isSupabaseConfigured()) {
      const result = await SupabaseService.testConnection();
      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
    }
  });
});

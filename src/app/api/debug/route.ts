export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const envKeys = Object.keys(process.env).sort();
  const hasDbUrl = 'DATABASE_URL' in process.env;
  const hasTursoUrl = 'TURSO_URL' in process.env;
  const hasTursoAuth = 'TURSO_AUTH_TOKEN' in process.env;
  const hasDbAuth = 'DATABASE_AUTH_TOKEN' in process.env;
  
  // Get first 20 chars of each sensitive value to verify they're set
  const dbUrlPreview = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT SET';
  const tursoUrlPreview = process.env.TURSO_URL ? process.env.TURSO_URL.substring(0, 30) + '...' : 'NOT SET';
  const tursoAuthPreview = process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.substring(0, 20) + '...' : 'NOT SET';
  
  return NextResponse.json({
    totalEnvVars: envKeys.length,
    hasDbUrl,
    hasTursoUrl,
    hasTursoAuth,
    hasDbAuth,
    dbUrlPreview,
    tursoUrlPreview,
    tursoAuthPreview,
    envKeysStartingWithD: envKeys.filter(k => k.startsWith('D') || k.startsWith('T')),
  });
}

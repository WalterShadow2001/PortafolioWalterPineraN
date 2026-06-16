import { getDb, getPortfolioData } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEditor } from '@/lib/auth/verify-editor';

// Use dynamic rendering but allow short-lived caching
export const dynamic = 'force-dynamic';

// In-memory cache for GET responses (fast reads)
let cachedProfile: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds cache for faster repeat loads

function invalidateCache() {
  cachedProfile = null;
  cacheTimestamp = 0;
}

// GET - Obtener todos los datos del portafolio (public, uses fast direct query with memory cache)
export async function GET() {
  try {
    // Check in-memory cache first
    const now = Date.now();
    if (cachedProfile && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(cachedProfile, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    const profile = await getPortfolioData();

    if (!profile) {
      // If no profile exists, create one via Prisma
      const db = getDb();
      const newProfile = await db.profile.create({
        data: {
          name: 'Juan Pérez',
          title: 'Desarrollador Full Stack',
          bio: 'Apasionado desarrollador con más de 5 años de experiencia creando aplicaciones web modernas y escalables.',
          email: 'juan.perez@email.com',
          phone: '+1 (555) 123-4567',
          location: 'Ciudad de México, México',
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
        },
        include: {
          socialLinks: true,
          projects: { orderBy: { order: 'asc' } },
          certificates: { orderBy: { order: 'asc' } },
          experiences: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
        },
      });
      cachedProfile = newProfile;
      cacheTimestamp = now;
      return NextResponse.json(newProfile, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    // Update cache
    cachedProfile = profile;
    cacheTimestamp = now;

    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Error fetching portfolio' }, { status: 500 });
  }
}

// PUT - Actualizar perfil completo (requires auth)
export async function PUT(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const { socialLinks, projects, certificates, experiences, skills, ...profileData } = data;

    const db = getDb();
    let profile = await db.profile.findFirst();

    if (!profile) {
      profile = await db.profile.create({
        data: {
          ...profileData,
          name: profileData.name || 'Mi Nombre',
          title: profileData.title || 'Mi Título',
        },
      });
    } else {
      profile = await db.profile.update({
        where: { id: profile.id },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
      });
    }

    if (socialLinks) {
      await db.socialLink.deleteMany({ where: { profileId: profile.id } });
      if (socialLinks.length > 0) {
        await db.socialLink.createMany({
          data: socialLinks.map((link: { platform: string; url: string; icon: string }) => ({
            ...link,
            profileId: profile.id,
          })),
        });
      }
    }

    // Invalidate cache after mutation
    invalidateCache();

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Error updating portfolio' }, { status: 500 });
  }
}

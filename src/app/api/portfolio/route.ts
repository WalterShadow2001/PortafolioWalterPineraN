import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener todos los datos del portafolio
export async function GET() {
  try {
    let profile = await prisma.profile.findFirst({
      include: {
        socialLinks: true,
        projects: { orderBy: { order: 'asc' } },
        certificates: { orderBy: { order: 'asc' } },
        experiences: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
      },
    });

    // Si no existe perfil, crear uno por defecto
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          name: 'Walter Pineda',
          title: 'Desarrollador Full Stack',
          bio: 'Apasionado desarrollador con experiencia creando aplicaciones web modernas.',
          email: 'walter@email.com',
          phone: '+1 234 567 890',
          location: 'Tu Ciudad, País',
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          socialLinks: {
            create: [
              { platform: 'github', url: 'https://github.com/WalterShadow2001', icon: 'Github' },
              { platform: 'linkedin', url: 'https://linkedin.com', icon: 'Linkedin' },
            ],
          },
        },
        include: {
          socialLinks: true,
          projects: { orderBy: { order: 'asc' } },
          certificates: { orderBy: { order: 'asc' } },
          experiences: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Error fetching portfolio' }, { status: 500 });
  }
}

// PUT - Actualizar perfil
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { socialLinks, projects, certificates, experiences, skills, ...profileData } = data;

    let profile = await prisma.profile.findFirst();

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          name: profileData.name || 'Walter Pineda',
          title: profileData.title || 'Desarrollador Full Stack',
          ...profileData,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
      });

      // Actualizar social links si se proporcionan
      if (socialLinks) {
        await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
        if (socialLinks.length > 0) {
          await prisma.socialLink.createMany({
            data: socialLinks.map((link: { platform: string; url: string; icon: string }) => ({
              ...link,
              profileId: profile.id,
            })),
          });
        }
      }
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Error updating portfolio' }, { status: 500 });
  }
}

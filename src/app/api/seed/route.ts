import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEditor } from '@/lib/auth/verify-editor';

// Seed route requires authentication
export async function GET(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    // Check if profile already exists
    const existingProfile = await getDb().profile.findFirst();

    if (existingProfile) {
      return NextResponse.json({ message: 'Database already seeded', profile: existingProfile });
    }

    // Create default profile
    const profile = await getDb().profile.create({
      data: {
        name: 'Juan García',
        title: 'Desarrollador Full Stack',
        bio: 'Desarrollador apasionado con más de 5 años de experiencia creando aplicaciones web modernas y escalables. Especializado en React, Node.js y tecnologías cloud.',
        email: 'juan.garcia@email.com',
        phone: '+34 612 345 678',
        location: 'Madrid, España',
        linkedin: 'https://linkedin.com/in/juangarcia',
        github: 'https://github.com/juangarcia',
        twitter: 'https://twitter.com/juangarcia',
        website: 'https://juangarcia.dev',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
      },
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
      profile
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}

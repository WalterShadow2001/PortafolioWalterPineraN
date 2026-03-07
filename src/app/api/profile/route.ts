import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch profile
export async function GET() {
  try {
    const profile = await db.profile.findFirst();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const existingProfile = await db.profile.findFirst();

    if (existingProfile) {
      const profile = await db.profile.update({
        where: { id: existingProfile.id },
        data: {
          name: data.name,
          title: data.title,
          photo: data.photo,
          bio: data.bio,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin,
          github: data.github,
          twitter: data.twitter,
          website: data.website,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          backgroundColor: data.backgroundColor,
        },
      });
      return NextResponse.json(profile);
    } else {
      const profile = await db.profile.create({
        data: {
          name: data.name || '',
          title: data.title || '',
          photo: data.photo,
          bio: data.bio,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin,
          github: data.github,
          twitter: data.twitter,
          website: data.website,
          primaryColor: data.primaryColor || '#3b82f6',
          secondaryColor: data.secondaryColor || '#64748b',
          accentColor: data.accentColor || '#f59e0b',
          backgroundColor: data.backgroundColor || '#ffffff',
        },
      });
      return NextResponse.json(profile);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

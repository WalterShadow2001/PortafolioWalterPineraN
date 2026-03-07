import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const experiences = await prisma.experience.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(experiences);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching experiences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const experience = await prisma.experience.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating experience' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const experience = await prisma.experience.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating experience' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.experience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting experience' }, { status: 500 });
  }
}

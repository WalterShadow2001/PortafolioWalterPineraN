import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const skills = await prisma.skill.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const skill = await prisma.skill.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating skill' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const skill = await prisma.skill.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating skill' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting skill' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const socialLinks = await prisma.socialLink.findMany({
      where: { profileId: profile.id },
    });
    return NextResponse.json(socialLinks);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching social links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const socialLink = await prisma.socialLink.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(socialLink);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating social link' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(socialLink);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating social link' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting social link' }, { status: 500 });
  }
}

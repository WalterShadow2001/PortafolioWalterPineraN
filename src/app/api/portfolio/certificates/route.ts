import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const certificates = await prisma.certificate.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(certificates);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching certificates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const certificate = await prisma.certificate.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating certificate' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const certificate = await prisma.certificate.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating certificate' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.certificate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting certificate' }, { status: 500 });
  }
}

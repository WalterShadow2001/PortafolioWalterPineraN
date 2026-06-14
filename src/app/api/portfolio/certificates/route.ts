import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEditor } from '@/lib/auth/verify-editor';

export const revalidate = 60;

export async function GET() {
  try {
    const profile = await getDb().profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const certificates = await getDb().certificate.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(certificates);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching certificates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const profile = await getDb().profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const certificate = await getDb().certificate.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating certificate' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const certificate = await getDb().certificate.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating certificate' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await getDb().certificate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting certificate' }, { status: 500 });
  }
}

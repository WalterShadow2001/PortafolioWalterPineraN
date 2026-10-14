import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEditor } from '@/lib/auth/verify-editor';

export const revalidate = 60;

export async function GET() {
  try {
    const profile = await getDb().profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const socialLinks = await getDb().socialLink.findMany({
      where: { profileId: profile.id },
    });
    return NextResponse.json(socialLinks);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching social links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const profile = await getDb().profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const socialLink = await getDb().socialLink.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(socialLink);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating social link' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const socialLink = await getDb().socialLink.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(socialLink);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating social link' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await verifyEditor(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await getDb().socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting social link' }, { status: 500 });
  }
}

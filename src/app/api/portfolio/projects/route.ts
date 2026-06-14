export const dynamic = 'force-dynamic';
import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
  try {
    const profile = await getDb().profile.findFirst();
    if (!profile) return NextResponse.json([]);
    const projects = await getDb().project.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = await getDb().profile.findFirst();
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const project = await getDb().project.create({
      data: { ...data, profileId: profile.id },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const project = await getDb().project.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await getDb().project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
  }
}

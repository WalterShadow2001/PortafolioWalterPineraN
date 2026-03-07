import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all projects
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get max order
    const maxOrder = await db.project.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const project = await db.project.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        technologies: data.technologies,
        date: data.date,
        images: data.images ? JSON.stringify(data.images) : null,
        order: nextOrder,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const project = await db.project.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        technologies: data.technologies,
        date: data.date,
        images: data.images ? JSON.stringify(data.images) : null,
        order: data.order,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    await db.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Crear proyecto
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: { name: 'Walter Pineda', title: 'Desarrollador' },
      });
    }

    const project = await prisma.project.create({
      data: {
        title: data.title || '',
        description: data.description || null,
        url: data.url || null,
        technologies: data.technologies || null,
        images: data.images || null,
        featured: data.featured || false,
        order: data.order || 0,
        profileId: profile.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
  }
}

// PUT - Actualizar proyecto
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Error updating project' }, { status: 500 });
  }
}

// DELETE - Eliminar proyecto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
  }
}

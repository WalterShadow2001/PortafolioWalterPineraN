import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Crear experiencia
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: { name: 'Walter Pineda', title: 'Desarrollador' },
      });
    }

    const experience = await prisma.experience.create({
      data: {
        title: data.title || '',
        company: data.company || '',
        location: data.location || null,
        startDate: data.startDate || '',
        endDate: data.endDate || null,
        description: data.description || null,
        type: data.type || 'work',
        order: data.order || 0,
        profileId: profile.id,
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Error creating experience' }, { status: 500 });
  }
}

// PUT - Actualizar experiencia
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
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Error updating experience' }, { status: 500 });
  }
}

// DELETE - Eliminar experiencia
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.experience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Error deleting experience' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Crear habilidad
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: { name: 'Walter Pineda', title: 'Desarrollador' },
      });
    }

    const skill = await prisma.skill.create({
      data: {
        name: data.name || '',
        level: data.level || 80,
        icon: data.icon || null,
        category: data.category || 'General',
        order: data.order || 0,
        profileId: profile.id,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Error creating skill' }, { status: 500 });
  }
}

// PUT - Actualizar habilidad
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
    console.error('Error updating skill:', error);
    return NextResponse.json({ error: 'Error updating skill' }, { status: 500 });
  }
}

// DELETE - Eliminar habilidad
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Error deleting skill' }, { status: 500 });
  }
}

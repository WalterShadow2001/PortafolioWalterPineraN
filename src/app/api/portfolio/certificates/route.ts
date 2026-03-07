import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Crear certificado
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: { name: 'Walter Pineda', title: 'Desarrollador' },
      });
    }

    const certificate = await prisma.certificate.create({
      data: {
        title: data.title || '',
        institution: data.institution || null,
        issueDate: data.issueDate || null,
        fileData: data.fileData || null,
        fileType: data.fileType || null,
        description: data.description || null,
        order: data.order || 0,
        profileId: profile.id,
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: 'Error creating certificate' }, { status: 500 });
  }
}

// PUT - Actualizar certificado
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
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: 'Error updating certificate' }, { status: 500 });
  }
}

// DELETE - Eliminar certificado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.certificate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return NextResponse.json({ error: 'Error deleting certificate' }, { status: 500 });
  }
}

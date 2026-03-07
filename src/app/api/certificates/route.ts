import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all certificates
export async function GET() {
  try {
    const certificates = await db.certificate.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

// POST - Create new certificate
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get max order
    const maxOrder = await db.certificate.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const certificate = await db.certificate.create({
      data: {
        title: data.title,
        institution: data.institution,
        date: data.date,
        file: data.file,
        fileType: data.fileType,
        type: data.type,
        order: nextOrder,
      },
    });
    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
  }
}

// PUT - Update certificate
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const certificate = await db.certificate.update({
      where: { id: data.id },
      data: {
        title: data.title,
        institution: data.institution,
        date: data.date,
        file: data.file,
        fileType: data.fileType,
        type: data.type,
        order: data.order,
      },
    });
    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}

// DELETE - Delete certificate
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    await db.certificate.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}

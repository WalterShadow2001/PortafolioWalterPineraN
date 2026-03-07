import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all experience
export async function GET() {
  try {
    const experience = await db.experience.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json({ error: 'Failed to fetch experience' }, { status: 500 });
  }
}

// POST - Create new experience
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get max order
    const maxOrder = await db.experience.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const experience = await db.experience.create({
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        type: data.type || 'work',
        order: nextOrder,
      },
    });
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

// PUT - Update experience
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const experience = await db.experience.update({
      where: { id: data.id },
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        type: data.type,
        order: data.order,
      },
    });
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

// DELETE - Delete experience
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    await db.experience.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}

// PATCH - Reorder experiences
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { orders } = data; // Array of { id, order }
    
    // Update each experience order
    for (const item of orders) {
      await db.experience.update({
        where: { id: item.id },
        data: { order: item.order },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering experience:', error);
    return NextResponse.json({ error: 'Failed to reorder experience' }, { status: 500 });
  }
}

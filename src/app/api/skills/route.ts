import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all skills
export async function GET() {
  try {
    const skills = await db.skill.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

// POST - Create new skill
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get max order
    const maxOrder = await db.skill.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const skill = await db.skill.create({
      data: {
        name: data.name,
        level: data.level || 50,
        icon: data.icon,
        category: data.category,
        order: nextOrder,
      },
    });
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}

// PUT - Update skill
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const skill = await db.skill.update({
      where: { id: data.id },
      data: {
        name: data.name,
        level: data.level,
        icon: data.icon,
        category: data.category,
        order: data.order,
      },
    });
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}

// DELETE - Delete skill
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Skill ID required' }, { status: 400 });
    }

    await db.skill.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}

// PATCH - Reorder skills
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { orders } = data; // Array of { id, order }
    
    // Update each skill order
    for (const item of orders) {
      await db.skill.update({
        where: { id: item.id },
        data: { order: item.order },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering skills:', error);
    return NextResponse.json({ error: 'Failed to reorder skills' }, { status: 500 });
  }
}

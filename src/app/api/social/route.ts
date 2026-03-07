import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all social links
export async function GET() {
  try {
    const socialLinks = await db.socialLink.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(socialLinks);
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
  }
}

// POST - Create new social link
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get max order
    const maxOrder = await db.socialLink.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const socialLink = await db.socialLink.create({
      data: {
        platform: data.platform,
        url: data.url,
        icon: data.icon,
        order: nextOrder,
      },
    });
    return NextResponse.json(socialLink);
  } catch (error) {
    console.error('Error creating social link:', error);
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}

// PUT - Update social link
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const socialLink = await db.socialLink.update({
      where: { id: data.id },
      data: {
        platform: data.platform,
        url: data.url,
        icon: data.icon,
        order: data.order,
      },
    });
    return NextResponse.json(socialLink);
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 });
  }
}

// DELETE - Delete social link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Social link ID required' }, { status: 400 });
    }

    await db.socialLink.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}

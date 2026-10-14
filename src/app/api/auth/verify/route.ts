import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TOKEN_NAME } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const isValid = await verifyToken(token);

    return NextResponse.json({ authenticated: isValid });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

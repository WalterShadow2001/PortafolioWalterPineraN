import { NextRequest, NextResponse } from 'next/server';
import { signToken, TOKEN_NAME } from '@/lib/auth/jwt';

const EDITOR_PASSWORD = '2001';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password !== EDITOR_PASSWORD) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    const token = await signToken();

    const response = NextResponse.json({ success: true, message: 'Autenticado' });

    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

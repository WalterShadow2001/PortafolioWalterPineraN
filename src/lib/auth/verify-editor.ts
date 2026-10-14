import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TOKEN_NAME } from '@/lib/auth/jwt';

export async function verifyEditor(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(TOKEN_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const isValid = await verifyToken(token);

  if (!isValid) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  return null; // No error, request is authorized
}

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'portfolio-editor-secret-key-2024-secure'
);

const TOKEN_NAME = 'portfolio_editor_token';
const TOKEN_EXPIRATION = '24h';

export { TOKEN_NAME };

export async function signToken(): Promise<string> {
  const token = await new SignJWT({ role: 'editor' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);
  return token;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'editor';
  } catch {
    return false;
  }
}

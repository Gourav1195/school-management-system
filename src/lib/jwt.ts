// import jwt from 'jsonwebtoken'

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

// export function generateJWT(payload: object) {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
// }

// export function verifyJWT(token: string) {
//   return jwt.verify(token, JWT_SECRET) as any
// }


//without jwt
type JWTPayload = {
  userId: string;
  tenantId: string;
  role: string;
  plan?: string; // optional if needed
  memberId: string;
};

import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string || 'supersecretkey0');

export async function generateJWT(payload: JWTPayload) {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime('1d')
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload as JWTPayload;
  } catch (err: any) {
    console.error('JWT verification failed:', err.code); // log but don’t crash
    return null;
  }
}

// export async function verifyJWT(token: string): Promise<JWTPayload> {
//   const { payload } = await jwtVerify(token, secret);
//   return payload as JWTPayload;
// }

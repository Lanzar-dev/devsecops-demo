import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface AccessTokenClaims {
  id: string;
  email: string;
}

export function signAccessToken(claims: AccessTokenClaims): string {
  const options: SignOptions = {
    subject: claims.id,
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  };
  return jwt.sign({ email: claims.email }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }

  if (typeof decoded === 'string' || !decoded.sub || typeof decoded.email !== 'string') {
    throw new UnauthorizedError('Malformed token');
  }

  return { id: decoded.sub, email: decoded.email };
}

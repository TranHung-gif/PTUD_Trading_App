import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { TokenPayload } from '../types/index.js'

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as string as any }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as string as any }
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options)
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload
}

export function generateTokens(payload: TokenPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

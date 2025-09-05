import jwt, { JwtPayload } from 'jsonwebtoken'

import { JWT_CONFIG } from '@/config/config'

export interface TokenPayload extends JwtPayload {
  sub: string
  role: number
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.secretKey as jwt.Secret, {
    expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn']
  })
}

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.secretKey) as TokenPayload
  } catch {
    throw new Error('Invalid token')
  }
}

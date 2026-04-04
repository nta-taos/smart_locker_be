import jwt, { JwtPayload } from 'jsonwebtoken'

import { JWT_CONFIG } from '@/config/config'

import { ErrorMessages } from '../constants/messages'
import { ApiError } from '../responses'

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
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized(ErrorMessages.TOKEN_EXPIRED)
    }
    throw ApiError.unauthorized(ErrorMessages.TOKEN_REQUIRED)
  }
}

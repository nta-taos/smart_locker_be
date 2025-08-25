import jwt from 'jsonwebtoken'

import { JWT_CONFIG } from '@/config/config'

interface ShareTokenPayload {
  sharedCollectionId: number
  collectionId: number
  sharedWithId: number
}

export const signToken = (payload: ShareTokenPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.secretKey as jwt.Secret, {
    expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn']
  })
}

export const verifyToken = (token: string): ShareTokenPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.secretKey) as ShareTokenPayload
  } catch {
    throw new Error('Invalid token')
  }
}

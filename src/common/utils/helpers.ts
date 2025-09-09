import { Request } from 'express'
import jwt from 'jsonwebtoken'

import { JWT_CONFIG } from '@/config/config'

export const getUserIdFromHeader = (req: Request): number | null => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secretKey) as jwt.JwtPayload
    return decoded.sub ? Number(decoded.sub) : null
  } catch {
    return null
  }
}

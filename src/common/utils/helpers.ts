import { Request } from 'express'
import jwt from 'jsonwebtoken'

import { JWT_CONFIG } from '@/config/config'

import { OrderType } from '../enum/order.enum'

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

export const calculateFee = (hours: number, type: number): number => {
  const rate = 5
  const roundedHours = parseFloat(hours.toFixed(2))

  switch (type) {
    case OrderType.USER_IN_BUILDING:
      return roundedHours > 24 ? (roundedHours - 24) * rate : 0
    case OrderType.USER_OUT_BUILDING:
      return roundedHours * rate
    case OrderType.SHIPPER_TO_USER_IN_BUILDING:
      return roundedHours > 24 * 3 ? (roundedHours - 24 * 3) * rate : 0
    case OrderType.SHIPPER_TO_USER_OUT_BUILDING:
      return roundedHours * rate
    default:
      return 0
  }
}

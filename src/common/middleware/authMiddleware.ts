import type { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { ApiError } from '@/common/responses/ApiError'
import { JWT_CONFIG } from '@/config/config'

import ClientRedis from '../../config/RedisClient'

const clientRedis = ClientRedis.getClient()

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token is required.'))
    }

    const isRevoked = await clientRedis.get(`blacklist:${token}`)
    if (isRevoked) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token has been revoked.'))
    }

    const decoded = jwt.verify(token, JWT_CONFIG.secretKey || 'tuananh123') as jwt.JwtPayload
    if (!decoded || !decoded.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên đang nhập đã hết hạn.'))
    }

    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên đang nhập đã hết hạn.'))
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên đang nhập đã hết hạn.'))
  }
}

import type { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { ApiError } from '@/common/responses/api-error'
import { JWT_CONFIG } from '@/config/config'

import ClientRedis from '../../config/redis'
import { ErrorMessages } from '../constants/messages'

const clientRedis = ClientRedis.getClient()

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorMessages.TOKEN_REQUIRED))
    }

    const isRevoked = await clientRedis.get(`blacklist:${token}`)
    if (isRevoked) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorMessages.TOKEN_REVOKED))
    }

    const decoded = jwt.verify(token, JWT_CONFIG.secretKey) as jwt.JwtPayload
    if (!decoded || !decoded.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorMessages.TOKEN_EXPIRED))
    }

    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorMessages.TOKEN_EXPIRED))
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED))
  }
}

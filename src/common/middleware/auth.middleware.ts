import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { ApiError } from '@/common/responses/api-error'
import { JWT_CONFIG } from '@/config/config'
import { redisService } from '@/config/redis'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { UserService } from '@/services/user.service'

import { ErrorMessages } from '../constants/messages'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      throw ApiError.unauthorized(ErrorMessages.TOKEN_REQUIRED)
    }

    const isRevoked = await redisService.safeGetCache(`blacklist:${token}`)
    if (isRevoked) {
      throw ApiError.unauthorized(ErrorMessages.TOKEN_REVOKED)
    }
    let decoded
    try {
      decoded = jwt.verify(token, JWT_CONFIG.secretKey) as jwt.JwtPayload
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized(ErrorMessages.TOKEN_EXPIRED)
      }
      throw ApiError.unauthorized(ErrorMessages.TOKEN_INVALID)
    }

    if (!decoded || !decoded.sub) {
      throw ApiError.unauthorized(ErrorMessages.TOKEN_INVALID)
    }

    const userService = container.get<UserService>(TYPES.UserService)
    const user = await userService.getUserById(parseInt(decoded.sub))
    if (!user) {
      throw ApiError.unauthorized(ErrorMessages.USER_NOT_FOUND)
    }
    req.user = user

    return next()
  } catch (error) {
    next(error)
  }
}

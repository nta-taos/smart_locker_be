import autoBind from 'auto-bind'
import bcryptjs from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
import { ErrorMessages, SuccessMessages } from '@/common/constants/messages'
import { ApiError, ApiSuccess } from '@/common/responses'
import { signToken } from '@/common/utils/jwt'
import { redisService } from '@/config/redis'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { AuthService } from '@/services/auth.service'

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {
    autoBind(this)
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, name, email, password, buildingId, role } = req.body

      const user = await this.authService.register(phone, name, email, password, buildingId, role)

      const userData = { ...user }
      delete (userData as Partial<User>).password
      await redisService.safeSetCache(CacheKeys.USER(user.id), userData)

      const token = signToken({
        sub: user.id.toString(),
        role: user.role
      })

      return ApiSuccess.created({ user: userData, token }, SuccessMessages.USER_REGISTERED).send(res)
    } catch (error: unknown) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body

      const user = await this.authService.findByPhone(phone)
      if (!user) {
        throw ApiError.unauthorized(ErrorMessages.LOGIN_FAILED)
      }
      const isMatch = await bcryptjs.compare(password, user.password)
      if (!isMatch) {
        throw ApiError.unauthorized(ErrorMessages.LOGIN_FAILED)
      }

      const token = signToken({
        sub: user.id.toString(),
        role: user.role
      })

      const userData = { ...user }
      delete (userData as Partial<typeof user>).password
      await redisService.safeSetCache(CacheKeys.USER(user.id), userData)

      return ApiSuccess.ok({ user: userData, token }, SuccessMessages.USER_LOGGED_IN).send(res)
    } catch (err) {
      next(err)
    }
  }
}

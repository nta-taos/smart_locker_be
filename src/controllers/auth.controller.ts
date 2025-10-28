import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
import { signToken } from '@/common/utils/jwt'
import TYPES from '@/di/types'
import { AuthService } from '@/services/auth.service'

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {
    autoBind(this)
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, name, email, password } = req.body

      const user = await this.authService.register(phone, name, email, password)

      const token = signToken({
        sub: user.id.toString(),
        role: user.role
      })

      return ApiSuccess.created({ user: user, token }, SuccessMessages.USER_REGISTERED).send(res)
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body
      const user = await this.authService.checkPass(phone, password)

      const token = signToken({
        sub: user.id.toString(),
        role: user.role
      })

      return ApiSuccess.ok({ user: user, token }, SuccessMessages.USER_LOGGED_IN).send(res)
    } catch (err) {
      next(err)
    }
  }
}

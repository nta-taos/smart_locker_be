import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
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

      return ApiSuccess.created(userData, SuccessMessages.USER_REGISTERED).send(res)
    } catch (error: unknown) {
      next(error)
    }
  }
}

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

  async googleCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body
      const result = await this.authService.verifyGoogleToken(idToken)

      if (result.status === 'existing_user') {
        const user = result.user
        if (!user) {
          throw new Error('User data missing for existing user')
        }
        const token = signToken({
          sub: user.id.toString(),
          role: user.role
        })

        return ApiSuccess.ok({ user: user, token: token }, SuccessMessages.USER_LOGGED_IN).send(res)
      } else {
        return ApiSuccess.ok(
          {
            status: 'new_user',
            email: result.email,
            name: result.name,
            picture: result.picture,
            idToken: idToken
          },
          'New user. Please complete registration.'
        ).send(res)
      }
    } catch (err) {
      next(err)
    }
  }
  async googleRegisterComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, phone } = req.body

      const { user, token } = await this.authService.completeGoogleRegistration(idToken, phone)

      return ApiSuccess.created({ user, token }, SuccessMessages.USER_REGISTERED).send(res)
    } catch (error) {
      next(error)
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      await this.authService.requestPasswordReset(email)

      return ApiSuccess.ok({}, SuccessMessages.RESET_CODE_SENT).send(res)
    } catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body
      await this.authService.resetPassword(token, newPassword)

      return ApiSuccess.ok({}, SuccessMessages.PASSWORD_RESET).send(res)
    } catch (error) {
      next(error)
    }
  }
}

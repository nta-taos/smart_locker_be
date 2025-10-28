import { Router } from 'express'

import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { AuthController } from '@/controllers/auth.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { LoginDto, RegisterDto } from '@/dtos/auth.dto'

export default function createAuthRouter(): Router {
  const router = Router()
  const authController = container.get<AuthController>(TYPES.AuthController)

  router.post('/register', validationMiddleware(RegisterDto), authController.register)
  router.post('/login', validationMiddleware(LoginDto), authController.login)
  router.post('/google-check', authController.googleCheck)
  router.post('/google-register-complete', authController.googleRegisterComplete)

  return router
}

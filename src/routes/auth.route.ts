import { Router } from 'express'

import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { AuthController } from '@/controllers/auth.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { LoginDto, RegisterDto } from '@/dtos/auth.dto'

const authRouter = Router()

const authController = container.get<AuthController>(TYPES.AuthController)

authRouter.post('/register', validationMiddleware(RegisterDto), authController.register)
authRouter.post('/login', validationMiddleware(LoginDto), authController.login)

export default authRouter

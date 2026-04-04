import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { UserController } from '@/controllers/user.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { UpdateUserDto } from '@/dtos/user.dto'
import { ImageUploadService } from '@/services/image-upload.service'

export default function createUserRouter(): Router {
  const router = Router()

  const userController = container.get<UserController>(TYPES.UserController)
  const uploadService = container.get<ImageUploadService>(TYPES.ImageUploadService)

  router.use(authMiddleware)
  router.put('/', uploadService.upload.single('avatar'), validationMiddleware(UpdateUserDto), userController.updateUser)

  return router
}

import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { ImageUploadService } from '@/services/image-upload.service'
import { UserService } from '@/services/user.service'

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService) private readonly userService: UserService,
    @inject(TYPES.ImageUploadService) private readonly uploadService: ImageUploadService
  ) {
    autoBind(this)
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const name = req.body.name
      const avatarFile = req.file
      const userId = (req.user as User).id
      let avatarUrl: string | undefined
      if (avatarFile) {
        const saved = await this.uploadService.saveFile(avatarFile)
        avatarUrl = saved.avatarPath
      }

      const updatedUser = await this.userService.updateUser(userId, name, avatarUrl)

      return ApiSuccess.ok(updatedUser, SuccessMessages.USER_UPDATED).send(res)
    } catch (error) {
      next(error)
    }
  }
}

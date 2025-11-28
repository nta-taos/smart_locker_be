import autoBind from 'auto-bind'
import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'

import { ApiError, ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { PushService } from '@/services/push.service'

@injectable()
export class PushController {
  constructor(@inject(TYPES.PushService) private readonly pushService: PushService) {
    autoBind(this)
  }

  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { subscription } = req.body
      const userId = (req.user as User)?.id
      if (!subscription) return ApiError.badRequest('subscription missing')
      const saved = await this.pushService.saveSubscription(subscription, userId)
      return ApiSuccess.ok(saved, 'Subscription saved')
    } catch (err) {
      next(err)
    }
  }

  async sendTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, subscription, payload } = req.body
      if (subscription) {
        await this.pushService.sendToSubscription(subscription, payload || { title: 'Test', body: 'This is a test' })
        return ApiSuccess.ok({}, 'Sent').send(res)
      }
      if (userId) {
        await this.pushService.sendToUser(Number(userId), payload || { title: 'Test', body: 'This is a test' })
        return ApiSuccess.ok({}, 'Sent to user').send(res)
      }

      return ApiError.badRequest('userId or subscription required').send(res)
    } catch (err) {
      next(err)
    }
  }
}

import autoBind from 'auto-bind'
import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { NotificationService } from '@/services/notification.service'

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private readonly notificationService: NotificationService
  ) {
    autoBind(this)
  }

  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10
      const notifications = await this.notificationService.getNotificationsByUser(userId, page, limit)
      return ApiSuccess.ok(notifications, SuccessMessages.NOTIFICATION_LIST).send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      const notificationId = Number(req.params.id)
      const updatedNotification = await this.notificationService.markAsRead(userId, notificationId)
      return ApiSuccess.ok(updatedNotification, SuccessMessages.NOTIFICATION_READ).send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * ✅ Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      const updatedCount = await this.notificationService.markAllAsRead(userId)
      return ApiSuccess.ok({ updatedCount }, SuccessMessages.NOTIFICATION_ALL_READ).send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Xóa 1 thông báo
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      const notificationId = Number(req.params.id)
      await this.notificationService.deleteNotification(userId, notificationId)
      return ApiSuccess.ok({}, SuccessMessages.NOTIFICATION_DELETED).send(res)
    } catch (error) {
      next(error)
    }
  }
}

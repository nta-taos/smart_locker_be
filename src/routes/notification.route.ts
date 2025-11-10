import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { NotificationController } from '@/controllers/notification.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

export default function createNotificationRouter(): Router {
  const router = Router()
  const notificationController = container.get<NotificationController>(TYPES.NotificationController)

  router.use(authMiddleware)
  router.get('/', notificationController.getNotifications)
  router.patch('/:id/read', notificationController.markAsRead)
  router.patch('/read-all', notificationController.markAllAsRead)

  return router
}

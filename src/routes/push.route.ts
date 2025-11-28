import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { PushController } from '@/controllers/push.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

export default function createPushRouter(): Router {
  const router = Router()
  const controller = container.get<PushController>(TYPES.PushController)

  // Protect subscribe endpoint with auth middleware
  router.post('/subscribe', authMiddleware, controller.subscribe)
  router.post('/send-test', controller.sendTest)

  return router
}

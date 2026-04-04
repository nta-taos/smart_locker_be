import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { PayosController } from '@/controllers/payos.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

export default function createPaymentsRouter(): Router {
  const router = Router()
  const controller = container.get<PayosController>(TYPES.PayosController)

  router.post('/payos/create', authMiddleware, controller.createPayment)

  router.post('/payos/confirm', controller.webhook)

  return router
}

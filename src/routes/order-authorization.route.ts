import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { OrderAuthorizationController } from '@/controllers/order-authorization.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

export default function createOrderAuthorizationRouter(): Router {
  const router = Router()
  const controller = container.get<OrderAuthorizationController>(TYPES.OrderAuthorizationController)

  router.post('/:orderId/confirm', controller.confirmAuthorizationByToken)
  router.use(authMiddleware)
  router.post('/', controller.createAuthorization)

  return router
}

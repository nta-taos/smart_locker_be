import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { OrderController } from '@/controllers/order.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { CreateOrderShipperDto, CreateOrderUserDto, GetOrdersQueryDto } from '@/dtos/order.dto'

export default function createOrderRouter(): Router {
  const router = Router()
  const orderController = container.get<OrderController>(TYPES.OrderController)

  router.use(authMiddleware)
  router.get('/', validationMiddleware(GetOrdersQueryDto, 'query'), orderController.getMyOrders)
  router.get('/stats/last-7-days', orderController.getStats)

  router.post('/user', validationMiddleware(CreateOrderUserDto), orderController.createOrderUser)
  router.post('/shipper', validationMiddleware(CreateOrderShipperDto), orderController.createOrderShipper)

  return router
}

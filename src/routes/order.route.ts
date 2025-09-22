import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { OrderController } from '@/controllers/order.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { CreateOrderShipperDto, CreateOrderUserDto, GetOrdersQueryDto } from '@/dtos/order.dto'

const orderRouter = Router()

const orderController = container.get<OrderController>(TYPES.OrderController)

orderRouter.use(authMiddleware)
orderRouter.get('/', validationMiddleware(GetOrdersQueryDto, 'query'), orderController.getMyOrders)
orderRouter.get('/stats/last-7-days', orderController.getStats)

orderRouter.post('/user', validationMiddleware(CreateOrderUserDto), orderController.createOrderUser)
orderRouter.post('/shipper', validationMiddleware(CreateOrderShipperDto), orderController.createOrderShipper)

export default orderRouter

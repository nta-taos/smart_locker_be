import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { UserRole } from '@/common/enum/role.enum'
import { ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { SendPackageDto } from '@/dtos/order.dto'
import { User } from '@/entities/user.model'
import { OrderService } from '@/services/order.service'

@injectable()
export class OrderController {
  constructor(@inject(TYPES.OrderService) private readonly orderService: OrderService) {
    autoBind(this)
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      const role = (req.user as User).role
      const page = parseInt(req.query.page as string) || undefined
      const limit = parseInt(req.query.limit as string) || undefined
      // (pending | received | all)
      const status = (req.query.status as string) || 'all'
      if (role === UserRole.SHIPPER) {
        const orders = await this.orderService.getOrdersByShipperId(userId, status, page, limit)
        return ApiSuccess.ok(orders, SuccessMessages.ORDERS_RETRIEVED).send(res)
      }
      const orders = await this.orderService.getOrdersByUserId(userId, status, page, limit)
      return ApiSuccess.ok(orders, SuccessMessages.ORDERS_RETRIEVED).send(res)
    } catch (err) {
      next(err)
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      const stats = await this.orderService.getOrderStatsLast7Days(userId)
      return ApiSuccess.ok(stats, SuccessMessages.ORDER_STATS_RETRIEVED).send(res)
    } catch (err) {
      next(err)
    }
  }

  async sendPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User
      const userId = user.id

      const sendData: SendPackageDto = req.body

      const order = await this.orderService.createSendPackageOrder(userId, sendData)

      return ApiSuccess.created(order, SuccessMessages.ORDER_CREATED).send(res)
    } catch (err) {
      next(err)
    }
  }
}

import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { OrderAuthorizationService } from '@/services/order-authorization.service'

@injectable()
export class OrderAuthorizationController {
  constructor(
    @inject(TYPES.OrderAuthorizationService)
    private readonly orderAuthorizationService: OrderAuthorizationService
  ) {
    autoBind(this)
  }

  async createAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as { id: number }
      const userId = user.id
      const { orderId, email, name } = req.body

      if (!orderId || !email || !name) {
        throw new Error('orderId, email và name là bắt buộc')
      }

      const authorization = await this.orderAuthorizationService.createAuthorization(userId, orderId, email, name)

      return ApiSuccess.created(authorization, SuccessMessages.ORDER_AUTHORIZATION_CREATED).send(res)
    } catch (err) {
      next(err)
    }
  }

  getAuthorizationByAccessLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { access_link } = req.query
      if (!access_link || typeof access_link !== 'string') {
        throw new Error('access_link là bắt buộc')
      }

      const data = await this.orderAuthorizationService.getAuthorizationByAccessLink(access_link)
      return ApiSuccess.ok(data, SuccessMessages.ORDER_AUTHORIZATION_RETRIEVED).send(res)
    } catch (err) {
      next(err)
    }
  }

  confirmAuthorizationByAccessLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { access_link } = req.body
      if (!access_link || typeof access_link !== 'string') {
        throw new Error('access_link là bắt buộc')
      }

      const data = await this.orderAuthorizationService.confirmAuthorizationByAccessLink(access_link)
      return ApiSuccess.ok(data, 'Xác nhận nhận hàng thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
}

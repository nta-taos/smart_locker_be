import autoBind from 'auto-bind'
import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'

import { ErrorMessages, SuccessMessages } from '@/common/constants/messages'
import { ApiError, ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { PayosService } from '@/services/payos.service'

@injectable()
export class PayosController {
  constructor(@inject(TYPES.PayosService) private readonly payosService: PayosService) {
    autoBind(this)
  }

  /**
   * Endpoint người dùng gọi để tạo link thanh toán PayOS
   */
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User
      if (!user || !user.id) throw ApiError.unauthorized(ErrorMessages.USER_NOT_FOUND)

      const amount = Number(req.body.amount)
      const orderId = req.body.orderId ? Number(req.body.orderId) : undefined

      if (!amount || amount <= 0) throw ApiError.badRequest('Số tiền phải lớn hơn 0')

      const result = await this.payosService.createPayment(user.id, amount, orderId)
      return ApiSuccess.ok(result, SuccessMessages.PAYMENT_CREATED).send(res)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Webhook từ PayOS gửi về khi thanh toán thành công
   * Bạn cấu hình URL này trong PayOS Dashboard
   */
  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderCode, amount, description, status, signature } = req.body

      if (!orderCode || !amount || !signature) {
        throw ApiError.badRequest(ErrorMessages.PAYMENT_INVALID_SIGNATURE)
      }

      // Verify signature
      const isValid = this.payosService.verifyChecksum(
        Number(orderCode),
        Number(amount),
        String(description),
        String(signature)
      )
      if (!isValid) throw ApiError.badRequest(ErrorMessages.PAYMENT_INVALID_SIGNATURE)

      // For PayOS, status should be PAID
      if (status !== 'PAID') {
        return ApiSuccess.ok({ status }, 'Payment not yet completed').send(res)
      }

      const info = await this.payosService.confirmPayment(Number(orderCode))
      if (!info) throw ApiError.badRequest('Transaction not found')

      return ApiSuccess.ok(info, SuccessMessages.PAYMENT_CONFIRMED).send(res)
    } catch (err) {
      next(err)
    }
  }
}

export default PayosController

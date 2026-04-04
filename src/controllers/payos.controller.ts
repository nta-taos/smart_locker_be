import autoBind from 'auto-bind'
import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'

import { ErrorMessages, SuccessMessages } from '@/common/constants/messages'
import { ApiError, ApiSuccess } from '@/common/responses'
import { verifyPayOSWebhookSignature } from '@/common/utils/payos'
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
      const checksumKey = process.env.PAYOS_CHECKSUM_KEY!

      const valid = verifyPayOSWebhookSignature(req.body, checksumKey)

      if (!valid) {
        console.warn('Webhook signature không hợp lệ.', req.body)
        throw ApiError.badRequest('Chữ ký không hợp lệ.')
      }

      console.log('✅ Webhook hợp lệ:', req.body.data)

      const { data } = req.body
      const { status, orderCode } = data

      if (data.desc !== 'success') {
        console.log(`Đơn hàng ${orderCode} có trạng thái ${status}, chưa xử lý.`)
        return res.json({ message: 'OK, status not PAID' })
      }

      console.log(`Trạng thái PAID, đang gọi service confirmPayment cho ${orderCode}...`)
      const info = await this.payosService.confirmPayment(Number(orderCode))

      if (!info) {
        console.error(`Không tìm thấy giao dịch ${orderCode} trong Redis để xác nhận`)
        throw ApiError.badRequest('Transaction not found or already processed')
      }

      console.log(`Cộng tiền thành công cho user ${info.userId}, đơn ${orderCode}`)
      res.json({ message: 'OK', data: info })
    } catch (err) {
      console.error('Lỗi nghiêm trọng khi xử lý webhook:', err)
      // Dùng next(err) để error handler chung của Express xử lý
      next(err)
    }
  }
}

export default PayosController

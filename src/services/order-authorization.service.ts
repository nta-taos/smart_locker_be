import autoBind from 'auto-bind'
import crypto from 'crypto'
import { injectable, inject } from 'inversify'
import { EntityManager } from 'typeorm'

import { ErrorMessages } from '@/common/constants/messages'
import { SlotStatus } from '@/common/enum/locker-slot.enum'
import { OrderAuthorizationStatus } from '@/common/enum/order-authorization.enum'
import { OrderStatus } from '@/common/enum/order.enum'
import { ApiError } from '@/common/responses'
import { CLIENT_BASE_URL } from '@/config/config'
import { AppDataSource } from '@/config/mysql'
import TYPES from '@/di/types'
import { OrderAuthorization } from '@/entities/order-authorization.model'
import { OrderAuthorizationRepository } from '@/repositories/order-authorization.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { UserRepository } from '@/repositories/user.repository'

import { MailService } from './mail.service'
import { MQTTService } from './mqtt.service'

@injectable()
export class OrderAuthorizationService {
  constructor(
    @inject(TYPES.OrderAuthorizationRepository)
    private readonly orderAuthRepo: OrderAuthorizationRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepo: UserRepository,
    @inject(TYPES.OrderRepository)
    private readonly orderRepo: OrderRepository,
    @inject(TYPES.MailService)
    private readonly mailService: MailService,
    @inject(TYPES.MQTTService)
    private readonly mqttService: MQTTService
  ) {
    autoBind(this)
  }

  /**
   * Tạo yêu cầu ủy quyền đơn hàng và gửi email xác thực
   */
  async createAuthorization(userId: number, orderId: number, email: string, name: string): Promise<OrderAuthorization> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw ApiError.badRequest(ErrorMessages.USER_NOT_FOUND)

    const order = await this.orderRepo.findById(orderId)
    if (!order) throw ApiError.notFound('Đơn hàng không tồn tại.')

    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const pin_code = Math.floor(100000 + Math.random() * 900000).toString()
      const token = crypto.randomBytes(16).toString('hex')

      const authorization = manager.create(OrderAuthorization, {
        order,
        name,
        email,
        status: OrderAuthorizationStatus.PENDING,
        pin_code,
        token
      })

      const saved = await manager.save(authorization)

      const verifyLink = `${CLIENT_BASE_URL}/order-authorization/${order.id}?token=${token}`

      const subject = 'Xác thực yêu cầu ủy quyền đơn hàng'
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1677ff; color: white; padding: 16px 24px; font-size: 18px;">
            Xác thực yêu cầu ủy quyền đơn hàng
          </div>
          <div style="padding: 24px;">
            <p>Xin chào <strong>${name}</strong>,</p>
            <p><strong>${user.name}</strong> vừa tạo yêu cầu ủy quyền cho bạn nhận <strong>đơn hàng #${order.id}</strong>.</p>
            <p>Vui lòng nhấn nút bên dưới để xác thực quyền truy cập:</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${verifyLink}" style="background-color: #1677ff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                Xác thực ngay
              </a>
            </p>
            <p style="text-align: center; margin: 12px 0;">Hoặc dùng mã PIN bên dưới để xác thực thủ công:</p>
            <p style="font-size: 24px; text-align: center; font-weight: bold; color: #1677ff; letter-spacing: 4px;">${pin_code}</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
            <p>Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.</p>
            <p style="margin-top: 32px;">Trân trọng,<br /><strong>Hệ thống Locker</strong></p>
          </div>
        </div>
      `

      await this.mailService.sendMail({
        to: email,
        subject,
        html
      })

      return saved
    })
  }

  /**
   * Xác nhận yêu cầu ủy quyền qua token
   */
  async confirmAuthorizationByToken(orderId: string, token: string) {
    const orderAuthorization = await this.orderAuthRepo.findOneByCondition(
      { token, order: { id: parseInt(orderId) } },
      { relations: ['order', 'order.lockerSlot', 'order.lockerSlot.locker'] }
    )

    if (!orderAuthorization) {
      throw ApiError.badRequest('Liên kết ủy quyền không hợp lệ hoặc đã hết hạn.')
    }

    if (orderAuthorization.status !== OrderAuthorizationStatus.PENDING) {
      throw ApiError.badRequest('Yêu cầu ủy quyền này đã được xử lý.')
    }

    const order = orderAuthorization.order
    const slot = order.lockerSlot

    if (!slot || !slot.locker) {
      throw ApiError.badRequest('Không tìm thấy locker tương ứng cho đơn hàng này.')
    }

    // try {
    //   await this.mqttService.sendCommand(slot.locker.id, slot.id, slot.hw_index, 'OPEN')
    // } catch {
    //   throw ApiError.internal('Không thể mở khóa thiết bị, vui lòng thử lại.')
    // }

    orderAuthorization.status = OrderAuthorizationStatus.USED
    order.status = OrderStatus.RECEIVED
    slot.status = SlotStatus.EMPTY

    await AppDataSource.transaction(async (manager) => {
      await manager.save(orderAuthorization)
      await manager.save(order)
      await manager.save(slot)
    })

    return { authorization: orderAuthorization, order }
  }
}

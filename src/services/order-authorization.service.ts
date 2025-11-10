import autoBind from 'auto-bind'
import crypto from 'crypto'
import { injectable, inject } from 'inversify'
import { EntityManager } from 'typeorm'

import { ErrorMessages } from '@/common/constants/messages'
import { SlotStatus } from '@/common/enum/locker-slot.enum'
import { OrderAuthorizationStatus } from '@/common/enum/order-authorization.enum'
import { OrderStatus } from '@/common/enum/order.enum'
import { ApiError } from '@/common/responses'
import { AppDataSource } from '@/config/mysql'
import TYPES from '@/di/types'
import { OrderAuthorization } from '@/entities/order-authorization.model'
import { OrderAuthorizationRepository } from '@/repositories/order-authorization.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { UserRepository } from '@/repositories/user.repository'

import { MailService } from './mail.service'

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
    private readonly mailService: MailService
  ) {
    autoBind(this)
  }

  async createAuthorization(userId: number, orderId: number, email: string, name: string): Promise<OrderAuthorization> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw ApiError.badRequest(ErrorMessages.USER_NOT_FOUND)

    const order = await this.orderRepo.findById(orderId)
    if (!order) throw ApiError.notFound('Đơn hàng không tồn tại.')

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.EXPIRED) {
      throw ApiError.badRequest('Không thể tạo yêu cầu ủy quyền cho đơn hàng này.')
    }

    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const pin_code = Math.floor(100000 + Math.random() * 900000).toString()
      const token = crypto.randomBytes(16).toString('hex')

      // Sử dụng CLIENT_BASE_URL từ env
      const clientBaseUrl = process.env.CLIENT_BASE_URL || 'https://yourapp.com'
      const access_link = `${clientBaseUrl}/order-authorization/${order.id}?token=${token}`

      const authorization = manager.create(OrderAuthorization, {
        order,
        name,
        email,
        status: OrderAuthorizationStatus.PENDING,
        pin_code,
        access_link
      })

      const saved = await manager.save(authorization)

      if (user.email) {
        const subject = 'Thông tin ủy quyền đơn hàng'
        const html = `
        <p>Xin chào ${user.name},</p>
        <p>Bạn vừa tạo yêu cầu ủy quyền cho đơn hàng #${order.id}.</p>
        <p><strong>Access Link:</strong> <a href="${access_link}">${access_link}</a></p>
        <p><strong>PIN Code:</strong> ${pin_code}</p>
        <p>Vui lòng sử dụng link và mã PIN trên để xác thực yêu cầu.</p>
        <p>Trân trọng,</p>
        <p>Hệ thống Locker</p>
      `
        await this.mailService.sendMail({ to: user.email, subject, html })
      }

      return saved
    })
  }

  async getAuthorizationByAccessLink(access_link: string) {
    const auth = await this.orderAuthRepo.findOneByCondition(
      { access_link },
      { relations: ['order', 'order.lockerSlot'] }
    )

    if (!auth) {
      throw ApiError.badRequest('Link ủy quyền không hợp lệ hoặc đã hết hạn.')
    }

    if (auth.status !== OrderAuthorizationStatus.PENDING) {
      throw ApiError.badRequest('Yêu cầu ủy quyền này đã được xử lý.')
    }

    return auth
  }

  async confirmAuthorizationByAccessLink(access_link: string) {
    const auth = await this.getAuthorizationByAccessLink(access_link)

    if (auth.status !== OrderAuthorizationStatus.PENDING) {
      throw ApiError.badRequest('Yêu cầu ủy quyền này đã được xử lý.')
    }

    auth.status = OrderAuthorizationStatus.USED

    const order = auth.order
    order.status = OrderStatus.RECEIVED

    if (order.lockerSlot) {
      order.lockerSlot.status = SlotStatus.EMPTY
    }

    await AppDataSource.transaction(async (manager) => {
      await manager.save(auth)
      await manager.save(order)
      if (order.lockerSlot) {
        await manager.save(order.lockerSlot)
      }
    })

    return { authorization: auth, order }
  }
}

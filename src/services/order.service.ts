import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { calculateFee } from '@/common/utils/helpers'
import TYPES from '@/di/types'
import { OrderRepository } from '@/repositories/order.repository'

@injectable()
export class OrderService {
  constructor(@inject(TYPES.OrderRepository) private readonly orderRepository: OrderRepository) {
    autoBind(this)
  }

  async getOrdersByUserId(userId: number, page: number = 1, limit: number = 6) {
    const { data, total } = await this.orderRepository.findAndCount({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver', 'lockerSlot'],
      order: { start_time: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        order_code: true,
        start_time: true,
        end_time: true,
        status: true,
        receiver_phone: true,
        fee: true,
        type: true,
        payment_status: true,
        sender: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          role: true
        },
        receiver: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          role: true
        },
        lockerSlot: {
          id: true,
          size: true
        }
      }
    })

    const order = data.map((o) => ({
      ...o,
      fee: o.fee ? o.fee : calculateFee(o.hours, o.type),
      hours: o.hours
    }))
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: order
    }
  }

  async getOrdersByShipperId(shipperId: number, page: number = 1, limit: number = 6) {
    const { data, total } = await this.orderRepository.findAndCount({
      where: [{ sender: { id: shipperId } }],
      relations: ['sender', 'receiver', 'lockerSlot'],
      order: { start_time: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        order_code: true,
        start_time: true,
        receiver_phone: true,
        sender: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          role: true
        },
        receiver: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          role: true
        },
        lockerSlot: {
          id: true,
          size: true
        }
      }
    })

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: data
    }
  }
}

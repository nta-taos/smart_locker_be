import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'
import { FindOptionsWhere } from 'typeorm'

import { OrderStatus } from '@/common/enum/order.enum'
import { calculateFee } from '@/common/utils/helpers'
import TYPES from '@/di/types'
import { Order } from '@/entities/order.model'
import { OrderRepository } from '@/repositories/order.repository'

@injectable()
export class OrderService {
  constructor(@inject(TYPES.OrderRepository) private readonly orderRepository: OrderRepository) {
    autoBind(this)
  }

  async getOrdersByUserId(userId: number, status: string = 'all', page: number = 1, limit: number = 6) {
    const whereCondition: FindOptionsWhere<Order> = {
      sender: { id: userId },
      receiver: { id: userId }
    }

    if (status === 'pending') {
      whereCondition.status = OrderStatus.PENDING
    } else if (status === 'received') {
      whereCondition.status = OrderStatus.RECEIVED
    }

    const { data, total } = await this.orderRepository.findAndCount({
      where: whereCondition,
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
  async getOrdersByShipperId(shipperId: number, status: string = 'all', page: number = 1, limit: number = 6) {
    const whereCondition: FindOptionsWhere<Order> = {
      sender: { id: shipperId }
    }

    if (status === 'pending') {
      whereCondition.status = OrderStatus.PENDING
    } else if (status === 'received') {
      whereCondition.status = OrderStatus.RECEIVED
    }

    const { data, total } = await this.orderRepository.findAndCount({
      where: whereCondition,
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

  async getOrderStatsLast7Days(userId: number) {
    const shipperOrders = await this.orderRepository.countShipperOrdersLast7Days(userId)
    const userOrders = await this.orderRepository.countUserOrdersLast7Days(userId)

    const results: { date: string; shipperOrders: number; userOrders: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      results.push({
        date: dateStr,
        shipperOrders: shipperOrders.get(dateStr) ?? 0,
        userOrders: userOrders.get(dateStr) ?? 0
      })
    }

    return results
  }
}

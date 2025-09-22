import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'
import { FindOptionsWhere } from 'typeorm'

import { ErrorMessages } from '@/common/constants/messages'
import { SlotStatus } from '@/common/enum/locker-slot.enum'
import { LockerStatus } from '@/common/enum/locker.enum'
import { OrderStatus, OrderType, PaymentStatus } from '@/common/enum/order.enum'
import { ApiError } from '@/common/responses'
import { calculateFee } from '@/common/utils/helpers'
import { AppDataSource } from '@/config/mysql'
import TYPES from '@/di/types'
import { LockerSlot } from '@/entities/locker-slot.model'
import { Order } from '@/entities/order.model'
import { LockerSlotRepository } from '@/repositories/locker-slot.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
export class OrderService {
  constructor(
    @inject(TYPES.OrderRepository) private readonly orderRepository: OrderRepository,
    @inject(TYPES.LockerSlotRepository) private readonly lockerSlotRepository: LockerSlotRepository,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
  ) {
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

  async createOrderUser(userId: number, endTime: Date, lockerSlotId: number) {
    const user = await this.userRepository.findOneByCondition({ id: userId }, { relations: ['building'] })
    if (!user) {
      throw ApiError.badRequest(ErrorMessages.USER_NOT_FOUND)
    }

    return await AppDataSource.transaction(async (manager) => {
      const lockerSlot = await manager.findOne(LockerSlot, {
        where: { id: lockerSlotId },
        relations: ['locker', 'locker.building'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!lockerSlot) {
        throw ApiError.notFound(ErrorMessages.SLOT_NOT_FOUND)
      }
      if (lockerSlot.status !== SlotStatus.EMPTY) {
        throw ApiError.badRequest(ErrorMessages.SLOT_ALREADY_RENTED)
      }
      if (!lockerSlot.locker.building.isPublic && lockerSlot.locker.building.id !== user.building?.id) {
        throw ApiError.badRequest(ErrorMessages.SLOT_PERMISSION_DENIED)
      }
      if (lockerSlot.locker.status !== LockerStatus.Active) {
        throw ApiError.badRequest(ErrorMessages.LOCKER_INACTIVE)
      }

      const order = manager.create(Order, {
        sender: user,
        receiver: user,
        receiver_phone: user.phone,
        lockerSlot,
        start_time: new Date(),
        end_time: endTime,
        status: OrderStatus.PENDING,
        type:
          user.building?.id === lockerSlot.locker.building.id
            ? OrderType.USER_IN_BUILDING
            : OrderType.USER_OUT_BUILDING,
        payment_status: PaymentStatus.UNPAID
      })

      await manager.save(order)

      lockerSlot.status = SlotStatus.OCCUPIED
      await manager.save(lockerSlot)

      return order
    })
  }

  async createOrderShpper(shipperId: number, phone: string, lockerSlotId: number, order_code: string) {
    const shipper = await this.userRepository.findById(shipperId)
    if (!shipper) {
      throw ApiError.badRequest(ErrorMessages.USER_NOT_FOUND)
    }

    const user = await this.userRepository.findOneByCondition({ phone }, { relations: ['building'] })

    return await AppDataSource.transaction(async (manager) => {
      const lockerSlot = await manager.findOne(LockerSlot, {
        where: { id: lockerSlotId },
        relations: ['locker', 'locker.building'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!lockerSlot) {
        throw ApiError.notFound(ErrorMessages.SLOT_NOT_FOUND)
      }
      if (lockerSlot.status !== SlotStatus.EMPTY) {
        throw ApiError.badRequest(ErrorMessages.SLOT_ALREADY_RENTED)
      }
      if (user) {
        if (!lockerSlot.locker.building.isPublic && lockerSlot.locker.building.id !== user.building?.id) {
          throw ApiError.badRequest(ErrorMessages.SLOT_PERMISSION_DENIED)
        }
      }

      if (!user) {
        if (!lockerSlot.locker.building.isPublic) {
          throw ApiError.badRequest(ErrorMessages.SLOT_PERMISSION_DENIED)
        }
      }

      if (lockerSlot.locker.status !== LockerStatus.Active) {
        throw ApiError.badRequest(ErrorMessages.LOCKER_INACTIVE)
      }

      const order = manager.create(Order, {
        sender: shipper,
        order_code,
        receiver: user,
        receiver_phone: user?.phone ? user.phone : phone,
        lockerSlot,
        start_time: new Date(),
        end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: OrderStatus.PENDING,
        type: user
          ? user.building?.id === lockerSlot.locker.building.id
            ? OrderType.SHIPPER_TO_USER_IN_BUILDING
            : OrderType.SHIPPER_TO_USER_OUT_BUILDING
          : OrderType.SHIPPER_TO_GUEST,
        payment_status: PaymentStatus.UNPAID
      })

      await manager.save(order)

      lockerSlot.status = SlotStatus.OCCUPIED
      await manager.save(lockerSlot)

      return order
    })
  }
}

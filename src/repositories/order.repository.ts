import { injectable } from 'inversify'

import { OrderType } from '@/common/enum/order.enum'
import { Order } from '@/entities/order.model'

import { BaseRepository } from './base.repository'
import { IOderRepository } from './order.repository.interface'

@injectable()
export class OrderRepository extends BaseRepository<Order> implements IOderRepository {
  constructor() {
    super(Order)
  }

  private async countOrdersByDayLast7Days(userId: number, types: number[]): Promise<Map<string, number>> {
    const rawData = await this.repository
      .createQueryBuilder('order')
      .select("DATE_FORMAT(order.created_at, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.receiver_id = :userId', { userId })
      .andWhere('order.sender_id = :userId', { userId })
      .andWhere('order.type IN (:...types)', { types })
      .andWhere('order.created_at >= CURDATE() - INTERVAL 6 DAY')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: number }>()

    const dataMap = new Map(rawData.map((item) => [item.date, Number(item.count)]))

    return dataMap
  }

  async countShipperOrdersLast7Days(userId: number): Promise<Map<string, number>> {
    return this.countOrdersByDayLast7Days(userId, [OrderType.SEND_PACKAGE])
  }

  async countUserOrdersLast7Days(userId: number): Promise<Map<string, number>> {
    return this.countOrdersByDayLast7Days(userId, [OrderType.RENT_LOCKER])
  }
}

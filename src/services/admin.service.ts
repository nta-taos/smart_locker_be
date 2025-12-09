import autoBind from 'auto-bind'
import dayjs from 'dayjs'
import { injectable, inject } from 'inversify'

import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { DashboardStatsDto } from '@/dtos/admin.dto'
import { BuildingRepository } from '@/repositories/building.repository'
import { LockerSlotRepository } from '@/repositories/locker-slot.repository'
import { LockerRepository } from '@/repositories/locker.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { WalletTransactionRepository } from '@/repositories/wallet-transaction.repository'

import { MQTTService } from './mqtt.service'

@injectable()
export class AdminService {
  constructor(
    @inject(TYPES.OrderRepository) private readonly orderRepository: OrderRepository,
    @inject(TYPES.BuildingRepository) private readonly buildingRepository: BuildingRepository,
    @inject(TYPES.LockerRepository) private readonly lockerRepository: LockerRepository,
    @inject(TYPES.LockerSlotRepository) private readonly slotRepository: LockerSlotRepository,
    @inject(TYPES.WalletTransactionRepository) private readonly transactionRepository: WalletTransactionRepository,
    @inject(TYPES.MQTTService) private readonly mqttService: MQTTService
  ) {
    autoBind(this)
  }

  async getDashboardStats(userId: number, userRole: number, date?: string): Promise<DashboardStatsDto> {
    const targetDate = date ? dayjs(date) : dayjs()
    const startOfDay = targetDate.startOf('day').toDate()
    const endOfDay = targetDate.endOf('day').toDate()

    // Get total counts
    const totalBuildings = await this.buildingRepository.findAll()
    const totalLockers = await this.lockerRepository.findAll()
    const totalSlots = await this.slotRepository.findAll()
    const occupiedSlots = totalSlots.filter((slot) => slot.status === 2) // Status 2 = OCCUPIED

    // Get orders created today
    const ordersToday = await this.orderRepository
      .getQueryBuilder('order')
      .where('order.start_time >= :startOfDay', { startOfDay })
      .andWhere('order.start_time <= :endOfDay', { endOfDay })
      .getMany()

    const rentalsToday = ordersToday.length

    // Get transactions today to calculate revenue
    const transactionsToday = await this.transactionRepository
      .getQueryBuilder('transaction')
      .where('transaction.created_at >= :startOfDay', { startOfDay })
      .andWhere('transaction.created_at <= :endOfDay', { endOfDay })
      .andWhere('transaction.type = :type', { type: 0 }) // DEBIT transactions
      .getMany()

    const revenueToday = transactionsToday.reduce((sum, t) => sum + Number(t.amount), 0)

    // Get hourly rentals
    const hourlyRentals: Array<{ hour: number; count: number }> = []
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = targetDate.hour(hour).minute(0).second(0).toDate()
      const hourEnd = targetDate.hour(hour).minute(59).second(59).toDate()

      const count = await this.orderRepository
        .getQueryBuilder('order')
        .where('order.start_time >= :hourStart', { hourStart })
        .andWhere('order.start_time <= :hourEnd', { hourEnd })
        .getCount()

      hourlyRentals.push({ hour, count })
    }

    // Get hourly revenue
    const hourlyRevenue: Array<{ hour: number; amount: number }> = []
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = targetDate.hour(hour).minute(0).second(0).toDate()
      const hourEnd = targetDate.hour(hour).minute(59).second(59).toDate()

      const transactions = await this.transactionRepository
        .getQueryBuilder('transaction')
        .where('transaction.created_at >= :hourStart', { hourStart })
        .andWhere('transaction.created_at <= :hourEnd', { hourEnd })
        .andWhere('transaction.type = :type', { type: 0 }) // DEBIT
        .getMany()

      const amount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
      hourlyRevenue.push({ hour, amount })
    }

    const occupancyRate = totalSlots.length > 0 ? (occupiedSlots.length / totalSlots.length) * 100 : 0

    return {
      date: targetDate.format('YYYY-MM-DD'),
      rentalsToday,
      revenueToday,
      totalBuildings: totalBuildings.length,
      totalLockers: totalLockers.length,
      totalSlots: totalSlots.length,
      occupiedSlots: occupiedSlots.length,
      occupancyRate: Number(occupancyRate.toFixed(2)),
      hourlyRentals,
      hourlyRevenue
    }
  }

  async openLockerRemote(userId: number, userRole: number, slotId: number, reason?: string) {
    // Get slot with locker and building info
    const slot = await this.slotRepository.findById(slotId, {
      relations: ['locker', 'locker.building']
    })

    if (!slot) {
      throw ApiError.notFound('Không tìm thấy ngăn tủ.')
    }

    // All admins can open any locker (role >= 1)
    // No building restriction since we only have USER and ADMIN roles

    // Log the action (could save to database for audit trail)
    console.log(`[ADMIN REMOTE OPEN] User ${userId} opening slot ${slotId}. Reason: ${reason || 'N/A'}`)

    try {
      const response = await this.mqttService.sendCommand(
        slot.locker.id,
        slot.id,
        slot.hw_index,
        'OPEN',
        10000 // 10 second timeout
      )

      return {
        success: true,
        message: 'Ngăn tủ đã được mở thành công.',
        slotId,
        lockerId: slot.locker.id,
        response
      }
    } catch (error) {
      throw ApiError.badRequest(
        `Không thể mở ngăn tủ: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
      )
    }
  }
}

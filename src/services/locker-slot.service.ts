import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { CreateSlotDto, UpdateSlotDto } from '@/dtos/admin.dto'
import { LockerSlot } from '@/entities/locker-slot.model'
import { LockerSlotRepository } from '@/repositories/locker-slot.repository'
import { LockerRepository } from '@/repositories/locker.repository'

@injectable()
export class LockerSlotService {
  constructor(
    @inject(TYPES.LockerSlotRepository) private readonly slotRepository: LockerSlotRepository,
    @inject(TYPES.LockerRepository) private readonly lockerRepository: LockerRepository
  ) {
    autoBind(this)
  }

  async getSlotsByLocker(lockerId: number): Promise<LockerSlot[]> {
    return await this.slotRepository.findAll({
      where: { locker: { id: lockerId } },
      relations: ['locker', 'locker.building']
    })
  }

  async getAllSlots(): Promise<LockerSlot[]> {
    return await this.slotRepository.findAll({
      relations: ['locker', 'locker.building']
    })
  }

  async getSlotById(slotId: number): Promise<LockerSlot> {
    const slot = await this.slotRepository.findById(slotId, {
      relations: ['locker', 'locker.building']
    })

    if (!slot) {
      throw ApiError.notFound('Không tìm thấy ngăn tủ.')
    }

    return slot
  }

  async createSlot(data: CreateSlotDto): Promise<LockerSlot> {
    const locker = await this.lockerRepository.findById(data.lockerId)
    if (!locker) {
      throw ApiError.notFound('Không tìm thấy tủ.')
    }

    // Kiểm tra hw_index đã tồn tại trong locker này chưa
    const existing = await this.slotRepository.findOneByCondition({
      locker: { id: data.lockerId },
      hw_index: data.hw_index
    })
    if (existing) {
      throw ApiError.badRequest('Hardware index đã tồn tại trong tủ này.')
    }

    const slot = this.slotRepository.create({
      locker: locker,
      size: data.size,
      hw_index: data.hw_index,
      status: 0 // Default EMPTY
    })

    return await this.slotRepository.save(slot)
  }

  async updateSlot(slotId: number, data: UpdateSlotDto): Promise<LockerSlot> {
    const slot = await this.getSlotById(slotId)

    if (data.lockerId) {
      const locker = await this.lockerRepository.findById(data.lockerId)
      if (!locker) {
        throw ApiError.notFound('Không tìm thấy tủ.')
      }
      slot.locker = locker
    }

    if (data.size !== undefined) {
      slot.size = data.size
    }

    if (data.hw_index !== undefined) {
      // Kiểm tra hw_index mới có bị trùng không
      const existing = await this.slotRepository.findOneByCondition({
        locker: { id: slot.locker.id },
        hw_index: data.hw_index
      })
      if (existing && existing.id !== slotId) {
        throw ApiError.badRequest('Hardware index đã tồn tại trong tủ này.')
      }
      slot.hw_index = data.hw_index
    }

    if (data.status !== undefined) {
      slot.status = data.status
    }

    return await this.slotRepository.save(slot)
  }

  async deleteSlot(slotId: number): Promise<void> {
    const slot = await this.getSlotById(slotId)
    await this.slotRepository.softRemove(slot)
  }

  async updateSlotStatus(slotId: number, status: number): Promise<LockerSlot> {
    const slot = await this.getSlotById(slotId)
    slot.status = status
    return await this.slotRepository.save(slot)
  }
}

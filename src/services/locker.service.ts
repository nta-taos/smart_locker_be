import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { CreateLockerDto, UpdateLockerDto } from '@/dtos/admin.dto'
import { Locker } from '@/entities/locker.model'
import { BuildingRepository } from '@/repositories/building.repository'
import { LockerRepository } from '@/repositories/locker.repository'

@injectable()
export class LockerService {
  constructor(
    @inject(TYPES.LockerRepository) private readonly lockerRepository: LockerRepository,
    @inject(TYPES.BuildingRepository) private readonly buildingRepository: BuildingRepository
  ) {
    autoBind(this)
  }

  /**
   * Generate a unique locker code with format LK_XXXX (e.g., LK_0001, LK_0002)
   */
  private async generateLockerCode(): Promise<string> {
    // Get all existing locker codes
    const lockers = await this.lockerRepository.findAll({
      select: ['code'],
      order: { code: 'DESC' }
    })

    // Find the highest number from existing codes
    let maxNumber = 0
    for (const locker of lockers) {
      const match = locker.code.match(/^LK_(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    }

    // Increment and format with leading zeros
    const nextNumber = maxNumber + 1
    return `LK_${nextNumber.toString().padStart(4, '0')}`
  }

  async getLockersByBuilding(buildingId: number): Promise<Locker[]> {
    return await this.lockerRepository.findAll({
      where: { building: { id: buildingId } },
      relations: ['building', 'slots']
    })
  }

  async getAllLockers(): Promise<Locker[]> {
    return await this.lockerRepository.findAll({
      relations: ['building', 'slots']
    })
  }

  async getLockerById(lockerId: number): Promise<Locker> {
    const locker = await this.lockerRepository.findById(lockerId, {
      relations: ['building', 'slots']
    })

    if (!locker) {
      throw ApiError.notFound('Không tìm thấy tủ.')
    }

    return locker
  }

  async createLocker(data: CreateLockerDto): Promise<Locker> {
    const building = await this.buildingRepository.findById(data.buildingId)
    if (!building) {
      throw ApiError.notFound('Không tìm thấy tòa nhà.')
    }

    // Auto-generate locker code
    const code = await this.generateLockerCode()

    const locker = this.lockerRepository.create({
      code,
      building: building,
      status: data.status ?? 1, // Default Active
      floor: data.floor ?? null
    })

    return await this.lockerRepository.save(locker)
  }

  async updateLocker(lockerId: number, data: UpdateLockerDto): Promise<Locker> {
    const locker = await this.getLockerById(lockerId)

    if (data.buildingId) {
      const building = await this.buildingRepository.findById(data.buildingId)
      if (!building) {
        throw ApiError.notFound('Không tìm thấy tòa nhà.')
      }
      locker.building = building
    }

    if (data.status !== undefined) {
      locker.status = data.status
    }

    if (data.floor !== undefined) {
      locker.floor = data.floor
    }

    return await this.lockerRepository.save(locker)
  }

  async deleteLocker(lockerId: number): Promise<void> {
    const locker = await this.getLockerById(lockerId)
    await this.lockerRepository.softRemove(locker)
  }

  async updateLockerStatus(lockerId: number, status: number): Promise<Locker> {
    const locker = await this.getLockerById(lockerId)
    locker.status = status
    return await this.lockerRepository.save(locker)
  }
}

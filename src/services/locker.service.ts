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

    // Kiểm tra code đã tồn tại chưa
    const existing = await this.lockerRepository.findOneByCondition({ code: data.code })
    if (existing) {
      throw ApiError.badRequest('Mã tủ đã tồn tại.')
    }

    const locker = this.lockerRepository.create({
      code: data.code,
      building: building,
      status: data.status ?? 1, // Default Active
      floor: data.floor ?? null
    })

    return await this.lockerRepository.save(locker)
  }

  async updateLocker(lockerId: number, data: UpdateLockerDto): Promise<Locker> {
    const locker = await this.getLockerById(lockerId)

    if (data.code) {
      // Kiểm tra code mới có bị trùng không
      const existing = await this.lockerRepository.findOneByCondition({ code: data.code })
      if (existing && existing.id !== lockerId) {
        throw ApiError.badRequest('Mã tủ đã tồn tại.')
      }
      locker.code = data.code
    }

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

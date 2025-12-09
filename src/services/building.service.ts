import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { CreateBuildingDto, UpdateBuildingDto } from '@/dtos/admin.dto'
import { Building } from '@/entities/building.model'
import { BuildingRepository } from '@/repositories/building.repository'

import { RedisService } from './redis.service'

@injectable()
export class BuildingService {
  constructor(
    @inject(TYPES.BuildingRepository) private readonly buildingRepository: BuildingRepository,
    @inject(TYPES.RedisService) private readonly redisService: RedisService
  ) {
    autoBind(this)
  }

  async getAllBuildings(): Promise<Building[]> {
    return await this.buildingRepository.findAll({
      relations: ['lockers', 'lockers.slots']
    })
  }

  async getBuildingById(buildingId: number): Promise<Building> {
    const building = await this.buildingRepository.findById(buildingId, {
      relations: ['lockers', 'lockers.slots']
    })

    if (!building) {
      throw ApiError.notFound('Không tìm thấy tòa nhà.')
    }

    return building
  }

  async createBuilding(data: CreateBuildingDto): Promise<Building> {
    const building = this.buildingRepository.create({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      isPublic: data.isPublic
    })

    return await this.buildingRepository.save(building)
  }

  async updateBuilding(buildingId: number, data: UpdateBuildingDto): Promise<Building> {
    const building = await this.getBuildingById(buildingId)

    if (data.name) building.name = data.name
    if (data.address) building.address = data.address
    if (data.latitude !== undefined) building.latitude = data.latitude
    if (data.longitude !== undefined) building.longitude = data.longitude
    if (data.isPublic !== undefined) building.isPublic = data.isPublic

    return await this.buildingRepository.save(building)
  }

  async deleteBuilding(buildingId: number): Promise<void> {
    const building = await this.getBuildingById(buildingId)
    await this.buildingRepository.softRemove(building)
  }

  async getBuildingStats(buildingId: number) {
    const building = await this.getBuildingById(buildingId)

    const totalLockers = building.lockers?.length || 0
    const totalSlots = building.lockers?.reduce((sum, locker) => sum + (locker.slots?.length || 0), 0) || 0
    const occupiedSlots =
      building.lockers?.reduce(
        (sum, locker) => sum + (locker.slots?.filter((slot) => slot.status === 2).length || 0),
        0
      ) || 0

    return {
      building,
      totalLockers,
      totalSlots,
      occupiedSlots,
      occupancyRate: totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(2) : 0
    }
  }
}

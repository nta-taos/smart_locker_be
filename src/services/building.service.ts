import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import TYPES from '@/di/types'
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
}

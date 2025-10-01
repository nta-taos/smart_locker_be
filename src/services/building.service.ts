import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
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

  async getAccessibleBuildings(userId?: number | null): Promise<Building[]> {
    let publicBuildings = (await this.redisService.safeGetCache(CacheKeys.PUBLIC_BUILDINGS)) as Building[]
    if (!publicBuildings) {
      publicBuildings = await this.buildingRepository.findAll({
        where: { isPublic: true },
        relations: ['lockers', 'lockers.slots']
      })
      await this.redisService.safeSetCache(CacheKeys.PUBLIC_BUILDINGS, publicBuildings)
    }

    let userBuildings: Building[] = []
    if (userId) {
      userBuildings = await this.buildingRepository.findAll({
        where: {
          isPublic: false,
          users: { id: userId }
        },
        relations: ['lockers', 'lockers.slots']
      })
    }

    const allBuildings = [...publicBuildings, ...userBuildings]
    return allBuildings
  }
}

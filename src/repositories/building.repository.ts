import { injectable } from 'inversify'

import { Building } from '@/entities/building.model'

import { BaseRepository } from './base.repository'
import { IBuildingRepository } from './building.repository.interface'

@injectable()
export class BuildingRepository extends BaseRepository<Building> implements IBuildingRepository {
  constructor() {
    super(Building)
  }
}

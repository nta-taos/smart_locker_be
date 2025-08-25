import type {
  Repository,
  EntityTarget,
  FindOptionsWhere,
  DeepPartial,
  FindOptionsRelations,
  FindOptionsSelect
} from 'typeorm'

import { AppDataSource } from '../config/data-source'
import type { BaseModel } from '../entities/BaseModel'

export class BaseRepository<T extends BaseModel> {
  protected repository: Repository<T>

  constructor(entity: EntityTarget<T>) {
    this.repository = AppDataSource.getRepository(entity)
  }

  async findOne(id: number): Promise<T | null> {
    return this.repository.findOneBy({ id } as unknown as FindOptionsWhere<T>)
  }

  async findOneWithOptions(options: {
    where: FindOptionsWhere<T>
    relations?: FindOptionsRelations<T>
    select?: FindOptionsSelect<T>
  }): Promise<T | null> {
    return this.repository.findOne(options)
  }

  async findAll(): Promise<T[]> {
    return this.repository.find()
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data)
    return this.repository.save(entity)
  }

  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findOne(id)
    if (!entity) return null

    Object.assign(entity, data)
    return this.repository.save(entity)
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id)
    return result.affected ? result.affected > 0 : false
  }
}

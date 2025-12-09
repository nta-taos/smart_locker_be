import type { Repository, EntityTarget, FindOptionsWhere, DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm'

import { IBaseRepository } from './base.repository.interface'
import { AppDataSource } from '../config/mysql'
import type { BaseModel } from '../entities/base.model'

export class BaseRepository<T extends BaseModel> implements IBaseRepository<T> {
  protected repository: Repository<T>

  constructor(entity: EntityTarget<T>) {
    this.repository = AppDataSource.getRepository(entity)
  }

  // Find one by ID
  async findById(id: number, options?: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options
    })
  }

  // Find one by condition
  async findOneByCondition(where: FindOptionsWhere<T>, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T | null> {
    return this.repository.findOne({ where, ...options })
  }

  // Find all
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options)
  }

  // Find with pagination and count
  async findAndCount(options?: FindManyOptions<T>): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.repository.findAndCount(options)
    return { data, total }
  }

  // Create a new entity
  async createEntity(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data)
    return this.repository.save(entity)
  }

  // Update an existing entity
  async updateEntity(id: number, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findById(id)
    if (!entity) return null

    Object.assign(entity, data)
    return this.repository.save(entity)
  }

  // Delete an entity by ID
  async deleteEntity(id: number): Promise<boolean> {
    const result = await this.repository.softDelete(id)
    return (result?.affected ?? 0) > 0
  }

  // Additional convenience methods
  create(data: DeepPartial<T>): T {
    return this.repository.create(data)
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity)
  }

  async remove(entity: T): Promise<T> {
    return this.repository.remove(entity)
  }

  async softRemove(entity: T): Promise<T> {
    return this.repository.softRemove(entity)
  }

  getQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias)
  }
}

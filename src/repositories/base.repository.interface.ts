import type { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm'

export interface IBaseRepository<T> {
  // Find all entities with optional query options
  findAll(options?: FindManyOptions<T>): Promise<T[]>

  // Find one entity by ID with optional query options
  findById(id: number, options?: FindOneOptions<T>): Promise<T | null>

  // Find one entity by condition with optional query options (relations, select, etc.)
  findOneByCondition(where: FindOptionsWhere<T>, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T | null>

  // Create a new entity
  createEntity(data: DeepPartial<T>): Promise<T>

  // Update an existing entity
  updateEntity(id: number, data: DeepPartial<T>): Promise<T | null>

  // Delete an entity by ID
  deleteEntity(id: number): Promise<boolean>
}

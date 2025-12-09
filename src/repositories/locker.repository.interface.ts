import { Locker } from '@/entities/locker.model'

import { IBaseRepository } from './base.repository.interface'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILockerRepository extends IBaseRepository<Locker> {
  // Add custom methods here if needed
}

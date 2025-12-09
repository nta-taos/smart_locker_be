import { injectable } from 'inversify'

import { Locker } from '@/entities/locker.model'

import { BaseRepository } from './base.repository'
import { ILockerRepository } from './locker.repository.interface'

@injectable()
export class LockerRepository extends BaseRepository<Locker> implements ILockerRepository {
  constructor() {
    super(Locker)
  }
}

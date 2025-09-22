import { injectable } from 'inversify'

import { LockerSlot } from '@/entities/locker-slot.model'

import { BaseRepository } from './base.repository'
import { ILockerSlotRepository } from './locker-slot.repository.interface'

@injectable()
export class LockerSlotRepository extends BaseRepository<LockerSlot> implements ILockerSlotRepository {
  constructor() {
    super(LockerSlot)
  }
}

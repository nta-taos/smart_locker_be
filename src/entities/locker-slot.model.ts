import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm'

import { SlotSize, SlotStatus } from '@/common/enum/locker-slot.enum'

import { BaseModel } from './base.model'
import { Locker } from './locker.model'

@Entity('locker_slots')
@Unique(['locker', 'hw_index'])
export class LockerSlot extends BaseModel {
  @Index()
  @ManyToOne(() => Locker, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locker_id' })
  locker!: Locker

  @Column({ type: 'tinyint', nullable: false, comment: '0=Small, 1=Medium, 2=Large' })
  size!: SlotSize

  @Column({
    type: 'tinyint',
    default: SlotStatus.EMPTY,
    nullable: false,
    comment: '0=Empty, 1=Reserved, 2=Occupied, 3=Maintenance'
  })
  status!: SlotStatus

  @Column({
    type: 'tinyint',
    nullable: false
  })
  hw_index!: number
}

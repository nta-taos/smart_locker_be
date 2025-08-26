import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './BaseModel'
import { Locker } from './LockerModel'

@Entity('locker_slots')
export class LockerSlot extends BaseModel {
  @ManyToOne(() => Locker, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locker_id' })
  locker!: Locker

  @Column({ type: 'tinyint', nullable: false, comment: '0=Small, 1=Medium, 2=Large' })
  size!: number

  @Column({ type: 'tinyint', default: 0, nullable: false, comment: '0=Empty, 1=Reserved, 2=Occupied, 3=Maintenance' })
  status!: number
}

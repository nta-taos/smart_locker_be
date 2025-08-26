import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './BaseModel'
import { LockerSlot } from './LockerSlotModel'
import { User } from './UserModel'

@Entity('rentals')
export class Rental extends BaseModel {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => LockerSlot, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locker_slot_id' })
  lockerSlot!: LockerSlot

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  hours!: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  fee!: number

  @Column({ type: 'datetime', nullable: false })
  start_time!: Date

  @Column({ type: 'datetime', nullable: false })
  end_time!: Date
}

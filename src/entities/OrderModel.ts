import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './BaseModel'
import { LockerSlot } from './LockerSlotModel'
import { User } from './UserModel'

@Entity('orders')
export class Order extends BaseModel {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User

  @ManyToOne(() => LockerSlot, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locker_slot_id' })
  lockerSlot!: LockerSlot

  @Column({ type: 'tinyint', default: 0, nullable: false, comment: '0=pending, 1=delivered, 2=completed, 3=cancelled' })
  status!: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  option?: string
}

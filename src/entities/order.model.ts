import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './base.model'
import { LockerSlot } from './locker-slot.model'
import { User } from './user.model'

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

  @Column({
    type: 'tinyint',
    default: 0,
    nullable: false,
    comment: '0=Chưa gửi, 1=Đang gửi, 2=Đã nhận, 3=Quá hạn, 4=Đã hủy'
  })
  status!: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  option?: string

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  hours!: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  fee!: number

  @Column({ type: 'datetime', nullable: false })
  start_time!: Date

  @Column({ type: 'datetime', nullable: false })
  end_time!: Date

  @Column({ type: 'tinyint', default: 0, comment: '0=Người dùng tự thuê, 1=Shipper gửi' })
  type!: number

  @Column({ type: 'tinyint', default: 0, comment: '0=Chưa thanh toán, 1=Đã thanh toán' })
  payment_status!: number
}

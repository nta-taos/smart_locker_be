import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { OrderStatus, OrderType, PaymentStatus } from '@/common/enum/order.enum'

import { BaseModel } from './base.model'
import { LockerSlot } from './locker-slot.model'
import { User } from './user.model'

@Entity('orders')
export class Order extends BaseModel {
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  order_code!: string

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver?: User | null

  @Column({ type: 'varchar', length: 20, nullable: false })
  receiver_phone!: string

  @ManyToOne(() => LockerSlot, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locker_slot_id' })
  lockerSlot!: LockerSlot

  @Column({
    type: 'tinyint',
    default: OrderStatus.PENDING,
    nullable: false,
    comment: '0=Chưa gửi, 1=Đang gửi, 2=Đã nhận 3=Quá hạn'
  })
  status!: number

  @Column({ default: null, type: 'decimal', precision: 15, scale: 2, nullable: true })
  fee?: number | null

  @Column({ type: 'datetime', nullable: false })
  start_time!: Date

  @Column({ type: 'datetime', nullable: true })
  end_time!: Date

  get hours(): number {
    const end = this.end_time ? new Date(this.end_time) : new Date()
    const start = new Date(this.start_time)
    const diffMs = end.getTime() - start.getTime()
    return diffMs / (1000 * 60 * 60)
  }

  @Column({
    type: 'tinyint',
    default: OrderType.SHIPPER_TO_GUEST,
    comment:
      ' 0 = Người dùng tự thuê trong tòa nhà,1 = Người dùng tự thuê ngoài tòa nhà,2 = Shipper gửi cho người dùng trong tòa nhà,3 = Shipper gửi cho người dùng ngoài tòa nhà,4 = Shipper gửi cho khách chưa đăng ký'
  })
  type!: number

  @Column({ type: 'tinyint', default: PaymentStatus.UNPAID, comment: '0=Chưa thanh toán, 1=Đã thanh toán' })
  payment_status!: number
}

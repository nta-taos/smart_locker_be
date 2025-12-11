import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'

import { OrderStatus, OrderType, PaymentStatus } from '@/common/enum/order.enum'

import { BaseModel } from './base.model'
import { LockerSlot } from './locker-slot.model'
import { OrderAuthorization } from './order-authorization.model'
import { User } from './user.model'

@Entity('orders')
export class Order extends BaseModel {
  @Column({ type: 'varchar', length: 50, nullable: true })
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
    const hours = diffMs / (1000 * 60 * 60)
    return Math.round(hours * 100) / 100
  }

  @Column({
    type: 'tinyint',
    default: OrderType.RENT_LOCKER,
    comment: '0 = Thuê tủ, 1 = Gửi hàng'
  })
  type!: number

  @Column({ type: 'tinyint', default: PaymentStatus.UNPAID, comment: '0=Chưa thanh toán, 1=Đã thanh toán' })
  payment_status!: number

  @Column({ type: 'tinyint', default: 0, comment: '0 = Không phải đồ ăn, 1 = Đồ ăn' })
  is_food!: number

  @OneToMany(() => OrderAuthorization, (authorization) => authorization.order)
  authorizations!: OrderAuthorization[]
}

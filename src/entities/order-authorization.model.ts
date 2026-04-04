import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { OrderAuthorizationStatus } from '@/common/enum/order-authorization.enum'

import { BaseModel } from './base.model'
import { Order } from './order.model'

@Entity('order_authorizations')
export class OrderAuthorization extends BaseModel {
  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  email!: string

  @Column({ type: 'enum', enum: OrderAuthorizationStatus, default: OrderAuthorizationStatus.PENDING })
  status!: OrderAuthorizationStatus

  @Column({ type: 'varchar', length: 6, nullable: true })
  pin_code?: string

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string
}

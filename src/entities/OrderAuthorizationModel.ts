import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './BaseModel'
import { Order } from './OrderModel'
import { Rental } from './RentalModel'

@Entity('order_authorizations')
export class OrderAuthorization extends BaseModel {
  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @Column({ type: 'varchar', length: 100, nullable: false })
  email!: string

  @ManyToOne(() => Rental, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rental_id' })
  rental?: Rental

  @Column({ type: 'varchar', length: 255, nullable: false })
  pass!: string
}

import { Entity, Column, Unique, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm'

import { ApprovalStatus, UserRole } from '@/common/enum/role.enum'

import { BaseModel } from './base.model'
import { Building } from './building.model'
import { Order } from './order.model'
import { Rental } from './rental.model'
import { Wallet } from './wallet.model'

@Entity('users')
@Unique(['phone'])
@Unique(['email'])
export class User extends BaseModel {
  @Column({ type: 'varchar', length: 15, nullable: false })
  phone!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  email!: string

  @Column({
    type: 'tinyint',
    default: UserRole.USER,
    nullable: false,
    comment: 'Vai trò: 0=User, 1=Shipper, 2=Admin, 3=SuperAdmin'
  })
  role!: number

  @Column({
    type: 'tinyint',
    default: ApprovalStatus.PENDING,
    nullable: false,
    comment: 'Trạng thái phê duyệt: 0=Pending, 1=Accepted, 2=Rejected'
  })
  approval_status!: number

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  avatar?: string

  @ManyToOne(() => Building, (building) => building.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'building_id' })
  building?: Building

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet

  @OneToMany(() => Rental, (rental) => rental.user)
  rentals!: Rental[]

  @OneToMany(() => Order, (order) => order.sender)
  sentOrders!: Order[]

  @OneToMany(() => Order, (order) => order.receiver)
  receivedOrders!: Order[]
}

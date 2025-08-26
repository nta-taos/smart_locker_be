import { Entity, Column, Unique } from 'typeorm'

import { BaseModel } from './BaseModel'

@Entity('users')
@Unique(['phone'])
@Unique(['email'])
export class User extends BaseModel {
  @Column({ type: 'varchar', length: 15, nullable: false })
  phone!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  email!: string

  @Column({
    type: 'tinyint',
    default: 0,
    nullable: false,
    comment: 'Vai trò: 0=User, 1=Shipper, 2=Admin, 3=SuperAdmin'
  })
  role!: number

  @Column({
    type: 'tinyint',
    default: 0,
    nullable: false,
    comment: 'Trạng thái phê duyệt: 0=Pending, 1=Accepted, 2=Rejected'
  })
  approval_status!: number
}

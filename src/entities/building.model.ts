import { Entity, Column, OneToMany } from 'typeorm'

import { BaseModel } from './base.model'
import { Locker } from './locker.model'
import { User } from './user.model'

@Entity('buildings')
export class Building extends BaseModel {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  address!: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number

  @OneToMany(() => Locker, (locker) => locker.building)
  lockers!: Locker[]

  @OneToMany(() => User, (user) => user.building)
  users!: User[]
}

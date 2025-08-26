import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm'

import { BaseModel } from './BaseModel'
import { Building } from './BuildingModel'
import { Location } from './LocationModel'
import { User } from './UserModel'

@Entity('lockers')
@Unique(['code'])
export class Locker extends BaseModel {
  @Column({ type: 'varchar', length: 50, nullable: false })
  code!: string

  @ManyToOne(() => Building, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'building_id' })
  building!: Building

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: Location

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'admin_id' })
  admin!: User

  @Column({
    type: 'tinyint',
    default: 1,
    nullable: false,
    comment: 'Trạng thái: 0=Inactive, 1=Active, 2=Maintenance'
  })
  status!: number
}

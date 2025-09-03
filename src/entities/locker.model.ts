import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm'

import { BaseModel } from './base.model'
import { Building } from './building.model'

@Entity('lockers')
@Unique(['code'])
export class Locker extends BaseModel {
  @Column({ type: 'varchar', length: 50, nullable: false })
  code!: string

  @ManyToOne(() => Building, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'building_id' })
  building!: Building

  @Column({
    type: 'tinyint',
    default: 1,
    nullable: false,
    comment: 'Trạng thái: 0=Inactive, 1=Active, 2=Maintenance'
  })
  status!: number
}

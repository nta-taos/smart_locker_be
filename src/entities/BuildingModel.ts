import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './BaseModel'
import { Location } from './LocationModel'

@Entity('buildings')
export class Building extends BaseModel {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string

  @ManyToOne(() => Location, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'location_id' })
  location!: Location
}

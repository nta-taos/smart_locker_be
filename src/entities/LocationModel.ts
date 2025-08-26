import { Entity, Column } from 'typeorm'

import { BaseModel } from './BaseModel'

@Entity('locations')
export class Location extends BaseModel {
  @Column({ type: 'varchar', length: 255, nullable: false })
  address!: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number
}

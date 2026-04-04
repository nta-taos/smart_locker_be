import { Entity, Column, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm'

import { LockerStatus } from '@/common/enum/locker.enum'

import { BaseModel } from './base.model'
import { Building } from './building.model'
import { LockerSlot } from './locker-slot.model'

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
    default: LockerStatus.Active,
    nullable: false,
    comment: 'Trạng thái: 0=Inactive, 1=Active, 2=Maintenance'
  })
  status!: number

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Số tầng đặt tủ (1, 2, -1 cho tầng hầm)'
  })
  floor!: number | null

  @OneToMany(() => LockerSlot, (slot) => slot.locker)
  slots!: LockerSlot[]
}

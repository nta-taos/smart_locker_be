import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import { NotificationType } from '@/common/enum/notification.enum'

import { BaseModel } from './base.model'
import { User } from './user.model'

@Entity('notifications')
export class Notification extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int', nullable: false })
  userId!: number

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'userId' })
  user!: User

  @Column({
    type: 'int',
    default: 4,
    nullable: false
  })
  type!: NotificationType
  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string

  @Column({ type: 'text', nullable: false })
  message!: string

  @Column({ type: 'boolean', default: false, nullable: false })
  isRead!: boolean

  @Column({ type: 'json', nullable: true })
  data?: object
}

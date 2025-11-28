import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './base.model'
import { User } from './user.model'

@Entity('push_subscriptions')
export class PushSubscription extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int', nullable: true })
  userId?: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User

  @Column({ type: 'text', nullable: false })
  endpoint!: string

  @Column({ type: 'json', nullable: false })
  keys!: { p256dh: string; auth: string }
}

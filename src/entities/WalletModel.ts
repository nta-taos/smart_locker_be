import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './BaseModel'
import { User } from './UserModel'

@Entity('wallets')
export class Wallet extends BaseModel {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  balance!: number
}

import { Entity, Column, OneToMany, OneToOne } from 'typeorm'

import { BaseModel } from './base.model'
import { User } from './user.model'
import { WalletTransaction } from './wallet-transaction.model'

@Entity('wallets')
export class Wallet extends BaseModel {
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  balance!: number

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions!: WalletTransaction[]

  @OneToOne(() => User, (user) => user.wallet)
  user!: User
}

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseModel } from './base.model'
import { Wallet } from './wallet.model'

@Entity('wallet_transactions')
export class WalletTransaction extends BaseModel {
  @ManyToOne(() => Wallet, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount!: number

  @Column({ type: 'tinyint', nullable: false, comment: '0=debit (-), 1=credit (+)' })
  type!: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string
}

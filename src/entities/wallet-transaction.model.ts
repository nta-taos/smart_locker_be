import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { TransactionType } from '@/common/enum/transaction.enum'

import { BaseModel } from './base.model'
import { Wallet } from './wallet.model'

@Entity('wallet_transactions')
export class WalletTransaction extends BaseModel {
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet

  @Column({ type: 'int', nullable: false })
  amount!: number

  @Column({
    type: 'tinyint',
    nullable: false,
    comment: '0=debit (-), 1=credit (+)'
  })
  type!: TransactionType

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string
}

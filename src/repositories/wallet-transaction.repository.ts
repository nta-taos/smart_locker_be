import { injectable } from 'inversify'

import { WalletTransaction } from '@/entities/wallet-transaction.model'

import { BaseRepository } from './base.repository'
import { IWalletTransactionRepository } from './wallet-transaction.repository.interface'

@injectable()
export class WalletTransactionRepository
  extends BaseRepository<WalletTransaction>
  implements IWalletTransactionRepository
{
  constructor() {
    super(WalletTransaction)
  }

  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 6
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const skip = (page - 1) * limit

    const qb = this.repository
      .createQueryBuilder('wt')
      .innerJoin('wt.wallet', 'w')
      .innerJoin('w.user', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('wt.deleted_at IS NULL')
      .orderBy('wt.created_at', 'DESC')
      .skip(skip)
      .take(limit)

    const [transactions, total] = await qb.getManyAndCount()

    return { transactions, total }
  }
}

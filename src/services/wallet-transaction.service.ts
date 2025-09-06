import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { redisService } from '@/config/redis'
import TYPES from '@/di/types'
import { WalletTransactionRepository } from '@/repositories/wallet-transaction.repository'

@injectable()
export class WalletTransactionService {
  constructor(
    @inject(TYPES.WalletTransactionRepository) private readonly transactionRepo: WalletTransactionRepository
  ) {
    autoBind(this)
  }

  async getTransactionsByUser(userId: number, page: number = 1, limit: number = 6) {
    const cached = await redisService.safeGetCache(`wallet-transaction:${userId}:${page}:${limit}`)
    if (cached) {
      return cached
    }

    const { transactions, total } = await this.transactionRepo.findByUserId(userId, page, limit)

    await redisService.safeSetCache(`wallet-transaction:${userId}:${page}:${limit}`, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: transactions
    })

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: transactions
    }
  }
}

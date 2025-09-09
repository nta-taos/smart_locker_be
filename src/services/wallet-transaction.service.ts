import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
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
    const cached = await redisService.safeGetCache(CacheKeys.WALLET_TRANSACTIONS(userId, page, limit))
    if (cached) {
      return cached
    }

    const { transactions, total } = await this.transactionRepo.findByUserId(userId, page, limit)

    await redisService.safeSetCache(CacheKeys.WALLET_TRANSACTIONS(userId, page, limit), {
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

import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import TYPES from '@/di/types'
import { WalletTransactionRepository } from '@/repositories/wallet-transaction.repository'

import { RedisService } from './redis.service'

@injectable()
export class WalletTransactionService {
  constructor(
    @inject(TYPES.WalletTransactionRepository) private readonly transactionRepo: WalletTransactionRepository,
    @inject(TYPES.RedisService) private readonly redisService: RedisService
  ) {
    autoBind(this)
  }

  async getTransactionsByUser(userId: number, page: number = 1, limit: number = 6) {
    const { transactions, total } = await this.transactionRepo.findByUserId(userId, page, limit)

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: transactions
    }
  }
}

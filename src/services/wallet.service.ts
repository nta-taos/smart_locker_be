import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { ErrorMessages } from '@/common/constants/messages'
import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { Wallet } from '@/entities/wallet.model'
import { UserRepository } from '@/repositories/user.repository'

import { RedisService } from './redis.service'

@injectable()
export class WalletService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.RedisService) private readonly redisService: RedisService
  ) {
    autoBind(this)
  }

  async getWalletByUserId(userId: number): Promise<Wallet> {
    const cachedWallet = await this.redisService.safeGetCache<Wallet>(`wallet:${userId}`)
    if (cachedWallet) {
      return cachedWallet
    }

    const user = await this.userRepository.findOneByCondition({ id: userId }, { relations: ['wallet'] })

    if (!user || !user.wallet) {
      throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
    }

    await this.redisService.safeSetCache(`wallet:${userId}`, user.wallet, 60 * 5)

    return user.wallet
  }
}

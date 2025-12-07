import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { ErrorMessages } from '@/common/constants/messages'
import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { Wallet } from '@/entities/wallet.model'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
export class WalletService {
  constructor(@inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {
    autoBind(this)
  }

  async getWalletByUserId(userId: number): Promise<Wallet> {
    const user = await this.userRepository.findOneByCondition({ id: userId }, { relations: ['wallet'] })
    if (!user) {
      throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
    }

    return user.wallet
  }
}

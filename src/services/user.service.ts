import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
import { redisService } from '@/config/redis'
import TYPES from '@/di/types'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
export class UserService {
  constructor(@inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {
    autoBind(this)
  }

  async getUserById(id: number) {
    const cached = await redisService.safeGetCache(CacheKeys.USER(id))
    if (cached) {
      return cached
    }

    const user = await this.userRepository.findById(id)
    if (user) {
      await redisService.safeSetCache(CacheKeys.USER(id), user)
    }

    return this.userRepository.findById(id)
  }
}

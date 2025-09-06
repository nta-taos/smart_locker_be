import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { redisService } from '@/config/redis'
import TYPES from '@/di/types'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
export class UserService {
  constructor(@inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {
    autoBind(this)
  }

  async getUserById(id: number) {
    const cached = await redisService.safeGetCache(`user:${id}`)
    if (cached) {
      return cached
    }

    const user = await this.userRepository.findById(id)
    if (user) {
      await redisService.safeSetCache(`user:${user.id}`, user)
    }

    return this.userRepository.findById(id)
  }
}

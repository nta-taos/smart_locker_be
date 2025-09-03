import { injectable, inject } from 'inversify'

import TYPES from '@/di/types'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
export class UserService {
  constructor(@inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {}
}

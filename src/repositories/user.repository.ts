import { injectable } from 'inversify'

import { User } from '@/entities/user.model'

import { BaseRepository } from './base.repository'
import { IUserRepository } from './user.repository.interface'

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(User)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOneByCondition({ email })
  }
}

export const userRepository = new UserRepository()

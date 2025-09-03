import { User } from '@/entities/user.model'

import { IBaseRepository } from './base.repository.interface'

export interface IUserRepository extends IBaseRepository<User> {
  /**
   * Find a user by email
   * @param email - user's email
   */
  findByEmail(email: string): Promise<User | null>
}

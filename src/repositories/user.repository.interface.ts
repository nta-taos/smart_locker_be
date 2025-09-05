import { User } from '@/entities/user.model'

import { IBaseRepository } from './base.repository.interface'

export interface IUserRepository extends IBaseRepository<User> {
  /**
   * Find a user by their email.
   * @param email - The email of the user to search for.
   * @returns The User if found, otherwise null.
   */
  findByEmail(email: string): Promise<User | null>

  /**
   * Find a user by their phone number.
   * @param phone - The phone number of the user to search for.
   * @returns The User if found, otherwise null.
   */
  findByPhone(phone: string): Promise<User | null>
}

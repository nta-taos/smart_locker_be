import { injectable, inject } from 'inversify'

import TYPES from '@/di/types'
import { UserService } from '@/services/user.service'

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private readonly userService: UserService) {}
}

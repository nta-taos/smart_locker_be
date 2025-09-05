import autoBind from 'auto-bind'
import { hash } from 'bcryptjs'
import { injectable, inject } from 'inversify'

import { ErrorMessages } from '@/common/constants/messages'
import { ApprovalStatus, UserRole } from '@/common/enum/role.enum'
import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { Wallet } from '@/entities/wallet.model'
import { BuildingRepository } from '@/repositories/building.repository'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.BuildingRepository) private readonly buildingRepository: BuildingRepository
  ) {
    autoBind(this)
  }

  async register(
    phone: string,
    name: string,
    email: string,
    password: string,
    buildingId?: number,
    role?: number
  ): Promise<User> {
    const [existingByPhone, existingByEmail, hashedPassword] = await Promise.all([
      this.userRepository.findByPhone(phone),
      this.userRepository.findByEmail(email),
      hash(password, 10)
    ])

    if (existingByPhone) throw ApiError.conflict(ErrorMessages.PHONE_ALREADY_REGISTERED)
    if (existingByEmail) throw ApiError.conflict(ErrorMessages.EMAIL_ALREADY_REGISTERED)

    const newUser = new User()
    newUser.phone = phone
    newUser.name = name
    newUser.email = email
    newUser.password = hashedPassword
    newUser.role = role ? role : UserRole.USER
    newUser.approval_status = ApprovalStatus.PENDING

    if (buildingId) {
      const building = await this.buildingRepository.findById(buildingId)
      if (!building) {
        throw ApiError.notFound(ErrorMessages.BUILDING_NOT_FOUND)
      }
      newUser.building = building
    }

    const newWallet = new Wallet()
    newUser.wallet = newWallet

    return this.userRepository.createEntity(newUser)
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone)
  }
}

import autoBind from 'auto-bind'
import { compare, hash } from 'bcryptjs'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
import { ErrorMessages } from '@/common/constants/messages'
import { ApprovalStatus, UserRole } from '@/common/enum/role.enum'
import { ApiError } from '@/common/responses'
import { toUserDTO } from '@/common/utils/user.helper'
import { redisService } from '@/config/redis'
import TYPES from '@/di/types'
import { UserDTO } from '@/dtos/user.dto'
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
  ): Promise<UserDTO> {
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
    const createdUser = await this.userRepository.createEntity(newUser)

    const savedUser = await this.userRepository.findOneByCondition(
      { id: createdUser.id },
      { relations: ['building', 'wallet'] }
    )

    if (!savedUser) {
      throw ApiError.internal(ErrorMessages.REGISTER_ERROR)
    }

    // set cache
    const userDto = toUserDTO(savedUser)
    await redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }

  async findByPhone(phone: string): Promise<UserDTO> {
    const user = await this.userRepository.findByPhone(phone)
    if (!user) {
      throw ApiError.internal(ErrorMessages.USER_NOT_FOUND)
    }

    // set cache
    const userDto = toUserDTO(user)
    await redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }

  async checkPass(phone: string, password: string): Promise<UserDTO> {
    const user = await this.userRepository.findOneByCondition({ phone: phone }, { relations: ['building', 'wallet'] })
    if (!user) {
      throw ApiError.notFound(ErrorMessages.LOGIN_FAILED)
    }
    const isMatch = await compare(password, user.password)
    if (!isMatch) {
      throw ApiError.unauthorized(ErrorMessages.LOGIN_FAILED)
    }

    // set cache
    const userDto = toUserDTO(user)
    await redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }
}

import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
import { ErrorMessages } from '@/common/constants/messages'
import { ApiError } from '@/common/responses'
import { toUserDTO } from '@/common/utils/user.helper'
import TYPES from '@/di/types'
import { UserDTO } from '@/dtos/user.dto'
import { User } from '@/entities/user.model'
import { UserRepository } from '@/repositories/user.repository'

import { RedisService } from './redis.service'

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.RedisService) private readonly redisService: RedisService
  ) {
    autoBind(this)
  }

  async getUserById(id: number): Promise<UserDTO> {
    // get cache
    const cachedUser = await this.redisService.safeGetCache<UserDTO>(CacheKeys.USER(id))
    if (cachedUser) {
      return cachedUser
    }

    // query DB
    const foundUser = await this.userRepository.findOneByCondition({ id }, { relations: ['building', 'wallet'] })
    if (!foundUser) {
      throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
    }

    // convert + set cache
    const userDto = toUserDTO(foundUser)
    await this.redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }

  async updateUser(id: number, name?: string, avatarUrl?: string): Promise<UserDTO> {
    let userDto = await this.redisService.safeGetCache<UserDTO>(CacheKeys.USER(id))

    let foundUser: User | null = null
    if (!userDto) {
      foundUser = await this.userRepository.findOneByCondition({ id }, { relations: ['building', 'wallet'] })
      if (!foundUser) {
        throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
      }
    } else {
      userDto = { ...userDto }
    }

    if (!foundUser) {
      foundUser = await this.userRepository.findOneByCondition({ id }, { relations: ['building', 'wallet'] })
      if (!foundUser) {
        throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
      }
    }

    if (name) {
      foundUser.name = name
    }

    if (avatarUrl) {
      foundUser.avatar = avatarUrl
    }

    const savedUser = await this.userRepository.updateEntity(id, foundUser)
    if (!savedUser) {
      throw ApiError.internal(ErrorMessages.UPDATE_USER_FAILED)
    }

    const updatedUserDto = toUserDTO(savedUser)
    await this.redisService.safeSetCache(CacheKeys.USER(updatedUserDto.id), updatedUserDto)
    return updatedUserDto
  }
}

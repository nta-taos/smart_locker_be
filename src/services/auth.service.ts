import autoBind from 'auto-bind'
import { compare, hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { StatusCodes } from 'http-status-codes'
import { injectable, inject } from 'inversify'

import { CacheKeys } from '@/common/constants/cache-keys'
import { ErrorMessages } from '@/common/constants/messages'
import { ApprovalStatus, UserRole } from '@/common/enum/role.enum'
import { ApiError } from '@/common/responses'
import { signToken } from '@/common/utils/jwt'
import { toUserDTO } from '@/common/utils/user.helper'
import { CLIENT_BASE_URL } from '@/config/config'
import TYPES from '@/di/types'
import { UserDTO } from '@/dtos/user.dto'
import { User } from '@/entities/user.model'
import { Wallet } from '@/entities/wallet.model'
import { BuildingRepository } from '@/repositories/building.repository'
import { UserRepository } from '@/repositories/user.repository'

import { RedisService } from './redis.service'
import { MailService } from './mail.service'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
@injectable()
export class AuthService {
  private readonly resetPasswordTTL = 10 * 60

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.BuildingRepository) private readonly buildingRepository: BuildingRepository,
    @inject(TYPES.RedisService) private readonly redisService: RedisService,
    @inject(TYPES.MailService) private readonly mailService: MailService
  ) {
    autoBind(this)
  }

  async register(phone: string, name: string, email: string, password: string): Promise<UserDTO> {
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
    newUser.role = UserRole.USER
    newUser.approval_status = ApprovalStatus.PENDING

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
    await this.redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }

  async findByPhone(phone: string): Promise<UserDTO> {
    const user = await this.userRepository.findByPhone(phone)
    if (!user) {
      throw ApiError.internal(ErrorMessages.USER_NOT_FOUND)
    }

    // set cache
    const userDto = toUserDTO(user)
    await this.redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }

  async checkPass(phone: string, password: string): Promise<UserDTO> {
    const user = await this.userRepository.findOneByCondition({ phone: phone }, { relations: ['building', 'wallet'] })
    if (!user || !user.password) {
      throw ApiError.notFound(ErrorMessages.LOGIN_FAILED)
    }
    const isMatch = await compare(password, user.password)
    if (!isMatch) {
      throw ApiError.notFound(ErrorMessages.LOGIN_FAILED)
    }

    // set cache
    const userDto = toUserDTO(user)
    await this.redisService.safeSetCache(CacheKeys.USER(userDto.id), userDto)
    return userDto
  }

  /**
   * Xác thực Google idToken, kiểm tra DB và trả về 1 trong 2 kịch bản
   * @param idToken Token lấy từ FE
   */
  async verifyGoogleToken(idToken: string) {
    let payload
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      payload = ticket.getPayload()

      if (!payload || !payload.email) {
        throw new Error('Invalid Google token payload')
      }
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google token không hợp lệ.')
    }

    const { email, name, picture, email_verified } = payload

    if (!email_verified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email Google chưa được xác thực.')
    }

    const existingUser = await this.userRepository.findOneByCondition(
      { email: email_verified ? email : '' },
      { relations: ['building', 'wallet'] }
    )
    if (existingUser) {
      return {
        status: 'existing_user',
        user: existingUser
      }
    } else {
      return {
        status: 'new_user',
        email: email,
        name: name,
        picture: picture
      }
    }
  }

  async completeGoogleRegistration(idToken: string, phone: string) {
    let payload
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      payload = ticket.getPayload()
      if (!payload || !payload.email) throw new Error()
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google token không hợp lệ.')
    }

    const { email, name, picture, email_verified } = payload
    if (!email_verified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email Google chưa được xác thực.')
    }

    const existingEmail = await this.userRepository.findByEmail(email)
    if (existingEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email này đã được đăng ký.')
    }
    const existingPhone = await this.userRepository.findByPhone(phone)
    if (existingPhone) {
      throw new ApiError(StatusCodes.CONFLICT, 'Số điện thoại này đã được đăng ký.')
    }

    const newUser = await this.userRepository.createEntity({
      email: email,
      name: name,
      avatar: picture,
      phone: phone,
      password: null,
      role: UserRole.USER,
      wallet: new Wallet()
    })

    const savedUser = await this.userRepository.findOneByCondition(
      { id: newUser.id },
      { relations: ['building', 'wallet'] }
    )

    const token = signToken({
      sub: newUser.id.toString(),
      role: newUser.role
    })
    return { user: savedUser, token }
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
    }

    const token = this.generateResetCode()
    const cacheKey = CacheKeys.PASSWORD_RESET(token)
    await this.redisService.safeSetCache(cacheKey, { userId: user.id }, this.resetPasswordTTL)

    const resetLink = `${CLIENT_BASE_URL.replace(/\/$/, '')}/reset-password?token=${token}`

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      text: `Nhấn vào liên kết sau để đặt lại mật khẩu của bạn: ${resetLink}. Liên kết hết hạn sau 10 phút.`,
      html: `<p>Xin chào ${user.name},</p>
             <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Smart Locker.</p>
             <p>Vui lòng nhấn vào liên kết bên dưới trong vòng 10 phút để đặt lại mật khẩu:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>`
    })
  }

  async resetPassword(token: string, newPassword: string) {
    const cacheKey = CacheKeys.PASSWORD_RESET(token)
    const cached = await this.redisService.safeGetCache<{ userId: number }>(cacheKey)

    if (!cached) {
      throw ApiError.badRequest(ErrorMessages.RESET_CODE_EXPIRED)
    }

    const user = await this.userRepository.findById(cached.userId)
    if (!user) {
      throw ApiError.notFound(ErrorMessages.USER_NOT_FOUND)
    }

    const hashedPassword = await hash(newPassword, 10)
    await this.userRepository.updateEntity(user.id, { password: hashedPassword })
    await this.redisService.delCache(cacheKey)
  }

  private generateResetCode() {
    return randomBytes(32).toString('hex')
  }
}

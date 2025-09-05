import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, Matches, MinLength } from 'class-validator'

import { ValidationMessages } from '@/common/constants/messages'
import { UserRole } from '@/common/enum/role.enum'

/**
 * DTO for user registration
 */
export class RegisterDto {
  @IsNotEmpty({ message: ValidationMessages.PHONE_REQUIRED })
  @Matches(/^0\d{9}$/, {
    message: ValidationMessages.PHONE_INVALID
  })
  readonly phone!: string

  @IsNotEmpty({ message: ValidationMessages.NAME_REQUIRED })
  readonly name!: string

  @IsNotEmpty({ message: ValidationMessages.EMAIL_REQUIRED })
  @IsEmail({}, { message: ValidationMessages.EMAIL_INVALID })
  readonly email!: string

  @IsNotEmpty({ message: ValidationMessages.PASSWORD_REQUIRED })
  @MinLength(8, { message: ValidationMessages.PASSWORD_MIN_LENGTH })
  readonly password!: string

  @IsOptional()
  @IsNumber({}, { message: ValidationMessages.BUILDING_ID_NUMBER })
  readonly buildingId?: number

  @IsOptional()
  @IsIn([UserRole.USER, UserRole.SHIPPER], { message: ValidationMessages.ROLE_INVALID })
  readonly role?: number
}

/**
 * DTO for user login
 */
export class LoginDto {
  @IsNotEmpty({ message: ValidationMessages.PHONE_REQUIRED })
  @Matches(/^0\d{9}$/, {
    message: ValidationMessages.PHONE_INVALID
  })
  readonly phone!: string

  @IsNotEmpty({ message: ValidationMessages.PASSWORD_REQUIRED })
  @MinLength(8, { message: ValidationMessages.PASSWORD_MIN_LENGTH })
  readonly password!: string
}

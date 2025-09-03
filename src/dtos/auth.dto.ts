import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

/**
 * DTO for user registration
 */
export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  readonly name!: string

  @IsEmail({}, { message: 'Email must be valid' })
  readonly email!: string

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  readonly password!: string
}

/**
 * DTO for user login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email must be valid' })
  readonly email!: string

  @IsNotEmpty({ message: 'Password is required' })
  readonly password!: string
}

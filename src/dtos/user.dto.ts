import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator'

import { ValidationMessages } from '@/common/constants/messages'

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: ValidationMessages.NAME_REQUIRED })
  @MaxLength(50, { message: ValidationMessages.NAME_MAX_LENGTH })
  readonly name?: string
}

export interface UserDTO {
  id: number
  name: string
  phone: string
  email: string
  role: number
  approval_status: number
  avatar: string | null
  building?: {
    id: number
    name: string
    address: string
    latitude?: number | null
    longitude?: number | null
  } | null
  wallet?: {
    id: number
    balance: number
    updated_at?: Date
  } | null
  created_at?: Date
  updated_at?: Date
}

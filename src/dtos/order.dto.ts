import { Type } from 'class-transformer'
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Min, MinDate } from 'class-validator'

import { ValidationMessages } from '@/common/constants/messages'

export class GetOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: ValidationMessages.PAGE_MIN })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: ValidationMessages.LIMIT_MIN })
  limit?: number

  @IsOptional()
  @IsIn(['pending', 'received', 'all'], {
    message: 'Status must be one of: pending, received, all'
  })
  status?: 'pending' | 'received' | 'all' = 'all'
}

export class CreateOrderUserDto {
  @IsNotEmpty({ message: ValidationMessages.LOCKER_SLOT_REQUIRED })
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.LOCKER_SLOT_INVALID })
  lockerSlotId!: number

  @IsNotEmpty({ message: ValidationMessages.END_TIME_REQUIRED })
  @Type(() => Date)
  @IsDate({ message: ValidationMessages.END_TIME_INVALID })
  @MinDate(new Date(), { message: ValidationMessages.END_TIME_MIN })
  endTime!: Date
}

export class CreateOrderShipperDto {
  @IsNotEmpty({ message: ValidationMessages.PHONE_REQUIRED })
  @IsPhoneNumber('VN', { message: ValidationMessages.PHONE_INVALID })
  phone!: string

  @IsNotEmpty({ message: ValidationMessages.LOCKER_SLOT_REQUIRED })
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.LOCKER_SLOT_INVALID })
  lockerSlotId!: number

  @IsNotEmpty({ message: ValidationMessages.ORDER_CODE_REQUIRED })
  @IsString({ message: ValidationMessages.ORDER_CODE_INVALID })
  order_code!: string
}

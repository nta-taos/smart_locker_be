import { Type } from 'class-transformer'
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Min, MinDate } from 'class-validator'

import { ValidationMessages } from '@/common/constants/messages'
import { calculateFee } from '@/common/utils/helpers'
import { Order } from '@/entities/order.model'

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

export interface OrderDTO {
  id: number
  order_code: string
  receiver_phone: string
  status: number
  fee: number | null
  start_time: Date
  end_time: Date
  type: number
  payment_status: number
  sender: {
    id: number
    phone: string
    name: string
    role: number
    avatar: string | null
  }
  receiver: {
    id?: number
    phone?: string
    name?: string
    role?: number
    avatar?: string | null
  } | null
  lockerSlot: {
    id: number
    size: number
  }
  updated_at: Date
  hours: number
}

export function toOrderDTO(order: Order): OrderDTO {
  return {
    id: order.id,
    order_code: order.order_code,
    receiver_phone: order.receiver_phone,
    status: order.status,
    fee: order.fee ?? calculateFee(order.hours, order.type),
    start_time: order.start_time,
    end_time: order.end_time,
    type: order.type,
    payment_status: order.payment_status,
    sender: {
      id: order.sender.id,
      phone: order.sender.phone,
      name: order.sender.name,
      role: order.sender.role,
      avatar: order.sender.avatar ?? null
    },
    receiver: order.receiver
      ? {
          id: order.receiver.id,
          phone: order.receiver.phone,
          name: order.receiver.name,
          role: order.receiver.role,
          avatar: order.receiver.avatar ?? null
        }
      : null,
    lockerSlot: {
      id: order.lockerSlot.id,
      size: order.lockerSlot.size
    },
    updated_at: order.updated_at,
    hours: order.hours ?? 0
  }
}

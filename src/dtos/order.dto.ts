import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min
} from 'class-validator'

import { ValidationMessages } from '@/common/constants/messages'
import { SlotSize } from '@/common/enum/locker-slot.enum'
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

export class SendPackageDto {
  @IsInt({ message: 'ID tủ khóa phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID tủ khóa không được để trống.' })
  @Min(0, { message: 'ID tủ khóa phải lớn hơn hoặc bằng 0.' })
  lockerId!: number

  @IsDateString({}, { message: 'Thời gian nhận hàng không hợp lệ. Vui lòng sử dụng định dạng ISO 8601.' })
  @IsNotEmpty({ message: 'Thời gian nhận hàng không được để trống.' })
  receiveDateTime!: string

  @IsOptional()
  @IsString({ message: 'Mã đơn hàng phải là chuỗi ký tự.' })
  orderCode?: string

  @IsString({ message: 'Số điện thoại người nhận phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Số điện thoại người nhận không được để trống.' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại người nhận không hợp lệ (Việt Nam).' })
  receiverPhoneNumber!: string

  @IsEnum(SlotSize, {
    message: 'Kích thước slot không hợp lệ. Phải là 0 (SMALL), 1 (MEDIUM), hoặc 2 (LARGE).'
  })
  @IsNotEmpty({ message: 'Kích thước slot không được để trống.' })
  size!: SlotSize
}

export class RentLockerDto {
  @IsInt({ message: 'ID tủ khóa phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID tủ khóa không được để trống.' })
  @Min(0, { message: 'ID tủ khóa phải lớn hơn hoặc bằng 0.' })
  lockerId!: number
  @IsDateString({}, { message: 'Thời gian nhận tủ không hợp lệ. Vui lòng sử dụng định dạng ISO 8601.' })
  @IsNotEmpty({ message: 'Thời gian nhận tủ không được để trống.' })
  receiveDateTime!: string
  @IsEnum(SlotSize, {
    message: 'Kích thước slot không hợp lệ. Phải là 0 (SMALL), 1 (MEDIUM), hoặc 2 (LARGE).'
  })
  @IsNotEmpty({ message: 'Kích thước slot không được để trống.' })
  size!: SlotSize
}

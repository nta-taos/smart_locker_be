import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'

import { ValidationMessages } from '@/common/constants/messages'
import { SlotSize, SlotStatus } from '@/common/enum/locker-slot.enum'
import { LockerStatus } from '@/common/enum/locker.enum'

/**
 * DTO for creating a new building
 */
export class CreateBuildingDto {
  @IsNotEmpty({ message: 'Tên tòa nhà là bắt buộc.' })
  @IsString({ message: 'Tên tòa nhà phải là chuỗi ký tự.' })
  @MaxLength(100, { message: 'Tên tòa nhà không được quá 100 ký tự.' })
  readonly name!: string

  @IsNotEmpty({ message: 'Địa chỉ là bắt buộc.' })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự.' })
  @MaxLength(255, { message: 'Địa chỉ không được quá 255 ký tự.' })
  readonly address!: string

  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ phải là số.' })
  readonly latitude?: number

  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ phải là số.' })
  readonly longitude?: number

  @IsNotEmpty({ message: 'Trạng thái công khai là bắt buộc.' })
  @IsBoolean({ message: 'Trạng thái công khai phải là boolean.' })
  readonly isPublic!: boolean
}

/**
 * DTO for updating a building
 */
export class UpdateBuildingDto {
  @IsOptional()
  @IsString({ message: 'Tên tòa nhà phải là chuỗi ký tự.' })
  @MaxLength(100, { message: 'Tên tòa nhà không được quá 100 ký tự.' })
  readonly name?: string

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự.' })
  @MaxLength(255, { message: 'Địa chỉ không được quá 255 ký tự.' })
  readonly address?: string

  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ phải là số.' })
  readonly latitude?: number

  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ phải là số.' })
  readonly longitude?: number

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái công khai phải là boolean.' })
  readonly isPublic?: boolean
}

/**
 * DTO for creating a new locker
 * Note: code is auto-generated with format LK_XXXX
 */
export class CreateLockerDto {
  @IsNotEmpty({ message: 'ID tòa nhà là bắt buộc.' })
  @IsInt({ message: 'ID tòa nhà phải là số nguyên.' })
  @Min(1, { message: 'ID tòa nhà phải lớn hơn 0.' })
  readonly buildingId!: number

  @IsOptional()
  @IsEnum(LockerStatus, { message: 'Trạng thái tủ không hợp lệ.' })
  readonly status?: number

  @IsOptional()
  @IsInt({ message: 'Tầng phải là số nguyên.' })
  readonly floor?: number
}

/**
 * DTO for updating a locker
 * Note: code cannot be updated after creation
 */
export class UpdateLockerDto {
  @IsOptional()
  @IsInt({ message: 'ID tòa nhà phải là số nguyên.' })
  @Min(1, { message: 'ID tòa nhà phải lớn hơn 0.' })
  readonly buildingId?: number

  @IsOptional()
  @IsEnum(LockerStatus, { message: 'Trạng thái tủ không hợp lệ.' })
  readonly status?: number

  @IsOptional()
  @IsInt({ message: 'Tầng phải là số nguyên.' })
  readonly floor?: number
}

/**
 * DTO for creating a new slot
 */
export class CreateSlotDto {
  @IsNotEmpty({ message: 'ID tủ là bắt buộc.' })
  @IsInt({ message: 'ID tủ phải là số nguyên.' })
  @Min(1, { message: 'ID tủ phải lớn hơn 0.' })
  readonly lockerId!: number

  @IsNotEmpty({ message: 'Kích thước ngăn tủ là bắt buộc.' })
  @IsEnum(SlotSize, {
    message: 'Kích thước ngăn tủ không hợp lệ. Phải là 0 (SMALL), 1 (MEDIUM), hoặc 2 (LARGE).'
  })
  readonly size!: number

  @IsNotEmpty({ message: 'Chỉ số phần cứng là bắt buộc.' })
  @IsInt({ message: 'Chỉ số phần cứng phải là số nguyên.' })
  @Min(0, { message: 'Chỉ số phần cứng phải lớn hơn hoặc bằng 0.' })
  readonly hw_index!: number
}

/**
 * DTO for updating a slot
 */
export class UpdateSlotDto {
  @IsOptional()
  @IsInt({ message: 'ID tủ phải là số nguyên.' })
  @Min(1, { message: 'ID tủ phải lớn hơn 0.' })
  readonly lockerId?: number

  @IsOptional()
  @IsEnum(SlotSize, {
    message: 'Kích thước ngăn tủ không hợp lệ. Phải là 0 (SMALL), 1 (MEDIUM), hoặc 2 (LARGE).'
  })
  readonly size?: number

  @IsOptional()
  @IsInt({ message: 'Chỉ số phần cứng phải là số nguyên.' })
  @Min(0, { message: 'Chỉ số phần cứng phải lớn hơn hoặc bằng 0.' })
  readonly hw_index?: number

  @IsOptional()
  @IsEnum(SlotStatus, { message: 'Trạng thái ngăn tủ không hợp lệ.' })
  readonly status?: number
}

/**
 * DTO for opening locker remotely
 */
export class OpenLockerRemoteDto {
  @IsNotEmpty({ message: 'ID ngăn tủ là bắt buộc.' })
  @IsInt({ message: 'ID ngăn tủ phải là số nguyên.' })
  @Min(1, { message: 'ID ngăn tủ phải lớn hơn 0.' })
  readonly slotId!: number

  @IsOptional()
  @IsString({ message: 'Lý do phải là chuỗi ký tự.' })
  @MaxLength(255, { message: 'Lý do không được quá 255 ký tự.' })
  readonly reason?: string
}

/**
 * DTO for dashboard query parameters
 */
export class GetDashboardStatsDto {
  @IsOptional()
  @IsString({ message: 'Ngày phải là chuỗi ký tự.' })
  readonly date?: string
}

/**
 * DTO for locker query parameters
 */
export class GetLockersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.BUILDING_ID_NUMBER })
  @Min(1, { message: 'ID tòa nhà phải lớn hơn 0.' })
  readonly buildingId?: number
}

/**
 * DTO for slot query parameters
 */
export class GetSlotsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID tủ phải là số nguyên.' })
  @Min(1, { message: 'ID tủ phải lớn hơn 0.' })
  readonly lockerId?: number
}

/**
 * Interface for dashboard statistics response
 */
export interface DashboardStatsDto {
  date: string
  rentalsToday: number
  revenueToday: number
  totalBuildings: number
  totalLockers: number
  totalSlots: number
  occupiedSlots: number
  occupancyRate: number
  hourlyRentals: Array<{ hour: number; count: number }>
  hourlyRevenue: Array<{ hour: number; amount: number }>
}

import { Type } from 'class-transformer'
import { IsIn, IsOptional, Min } from 'class-validator'

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

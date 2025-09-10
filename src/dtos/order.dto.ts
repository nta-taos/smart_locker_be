import { Type } from 'class-transformer'
import { IsOptional, Min } from 'class-validator'

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
}

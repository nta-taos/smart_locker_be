import { IsString, MaxLength, MinLength } from 'class-validator'

export class ChatRequestDto {
  @IsString({ message: 'Tin nhắn phải là chuỗi.' })
  @MinLength(3, { message: 'Tin nhắn quá ngắn, vui lòng mô tả rõ hơn.' })
  @MaxLength(1000, { message: 'Tin nhắn tối đa 1000 ký tự.' })
  message!: string
}

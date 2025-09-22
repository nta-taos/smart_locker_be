import { APP_BASE_URL } from '@/config/config'
import { UserDTO } from '@/dtos/user.dto'
import { User } from '@/entities/user.model'

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    approval_status: user.approval_status,
    avatar: user.avatar ? `${APP_BASE_URL}${user.avatar}` : null,
    building: user.building
      ? {
          id: user.building.id,
          name: user.building.name,
          address: user.building.address,
          latitude: user.building.latitude ?? null,
          longitude: user.building.longitude ?? null
        }
      : null,
    wallet: user.wallet
      ? {
          id: user.wallet.id,
          balance: user.wallet.balance,
          updated_at: user.wallet.updated_at
        }
      : null,
    created_at: user.created_at,
    updated_at: user.updated_at
  }
}

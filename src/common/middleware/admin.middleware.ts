import type { Request, Response, NextFunction } from 'express'

import { ErrorMessages } from '@/common/constants/messages'
import { UserRole } from '@/common/enum/role.enum'
import { ApiError } from '@/common/responses/api-error'
import { User } from '@/entities/user.model'

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User

    if (!user) {
      throw ApiError.unauthorized(ErrorMessages.TOKEN_REQUIRED)
    }

    // Check if user has admin role (role >= 1)
    // UserRole: USER=0, ADMIN=1
    if (user.role < UserRole.ADMIN) {
      throw ApiError.forbidden('Bạn không có quyền truy cập trang quản trị.')
    }

    return next()
  } catch (error) {
    next(error)
  }
}

// Since we only have USER and ADMIN roles, superAdmin = admin
export const superAdminMiddleware = adminMiddleware

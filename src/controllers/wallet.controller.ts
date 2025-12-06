import autoBind from 'auto-bind'
import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'

import { ErrorMessages, SuccessMessages } from '@/common/constants/messages'
import { ApiError, ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { WalletService } from '@/services/wallet.service'

@injectable()
export class WalletController {
  constructor(@inject(TYPES.WalletService) private readonly walletService: WalletService) {
    autoBind(this)
  }

  async getWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User
      if (!user || !user.id) {
        throw ApiError.unauthorized(ErrorMessages.USER_NOT_FOUND)
      }

      const wallet = await this.walletService.getWalletByUserId(user.id)
      return ApiSuccess.ok(wallet, SuccessMessages.WALLET_FETCHED).send(res)
    } catch (error) {
      next(error)
    }
  }
}

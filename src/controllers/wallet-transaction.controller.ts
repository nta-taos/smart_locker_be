import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { ErrorMessages, SuccessMessages } from '@/common/constants/messages'
import { ApiError, ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { WalletTransactionService } from '@/services/wallet-transaction.service'

@injectable()
export class WalletTransactionController {
  constructor(@inject(TYPES.WalletTransactionService) private readonly transactionService: WalletTransactionService) {
    autoBind(this)
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as User).id
      if (!userId) {
        throw ApiError.badRequest(ErrorMessages.USER_NOT_FOUND)
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 6

      const result = await this.transactionService.getTransactionsByUser(userId, page, limit)

      return ApiSuccess.ok(result, SuccessMessages.TRANSACTION_RETRIEVED).send(res)
    } catch (err) {
      next(err)
    }
  }
}

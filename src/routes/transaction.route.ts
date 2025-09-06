import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { WalletTransactionController } from '@/controllers/wallet-transaction.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { TransactionQueryDto } from '@/dtos/transaction.dto'

const transactionRouter = Router()

const walletTransactionController = container.get<WalletTransactionController>(TYPES.WalletTransactionController)

transactionRouter.use(authMiddleware)
transactionRouter.get(
  '/',
  validationMiddleware(TransactionQueryDto, 'query'),
  walletTransactionController.getTransactions
)

export default transactionRouter

import { Router } from 'express'

import { authMiddleware } from '@/common/middleware/auth.middleware'
import { WalletController } from '@/controllers/wallet.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

export default function createWalletRouter(): Router {
  const router = Router()
  const controller = container.get<WalletController>(TYPES.WalletController)

  router.get('/', authMiddleware, controller.getWallet)

  return router
}

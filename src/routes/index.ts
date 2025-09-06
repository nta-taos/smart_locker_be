import { Router } from 'express'

import authRouter from './auth.route'
import transactionRouter from './transaction.route'

const routes = Router()

routes.use('/transactions', transactionRouter)
routes.use('/auth', authRouter)

export default routes

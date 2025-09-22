import { Router } from 'express'

import authRouter from './auth.route'
import buildingRouter from './building.route'
import orderRouter from './order.route'
import transactionRouter from './transaction.route'
import userRouter from './user.route'

const routes = Router()

routes.use('/transactions', transactionRouter)
routes.use('/auth', authRouter)
routes.use('/buildings', buildingRouter)
routes.use('/orders', orderRouter)
routes.use('/users', userRouter)

export default routes

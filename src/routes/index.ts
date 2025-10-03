import { Router } from 'express'

import createAuthRouter from './auth.route'
import createBuildingRouter from './building.route'
import createOrderRouter from './order.route'
import createTransactionRouter from './transaction.route'
import createUserRouter from './user.route'

export default function createRoutes(): Router {
  const routes = Router()

  routes.use('/transactions', createTransactionRouter())
  routes.use('/auth', createAuthRouter())
  routes.use('/buildings', createBuildingRouter())
  routes.use('/orders', createOrderRouter())
  routes.use('/users', createUserRouter())

  return routes
}

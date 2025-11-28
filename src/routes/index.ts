import { Router } from 'express'

import createAuthRouter from './auth.route'
import createBuildingRouter from './building.route'
import createNotificationRouter from './notification.route'
import createPushRouter from './push.route'
import createOrderAuthorizationRouter from './order-authorization.route'
import createOrderRouter from './order.route'
import createPaymentsRouter from './payments.route'
import createTransactionRouter from './transaction.route'
import createUserRouter from './user.route'

export default function createRoutes(): Router {
  const routes = Router()

  routes.use('/transactions', createTransactionRouter())
  routes.use('/auth', createAuthRouter())
  routes.use('/buildings', createBuildingRouter())
  routes.use('/orders', createOrderRouter())
  routes.use('/users', createUserRouter())
  routes.use('/notifications', createNotificationRouter())
  routes.use('/push', createPushRouter())
  routes.use('/payments', createPaymentsRouter())
  routes.use('/order-authorizations', createOrderAuthorizationRouter())

  return routes
}
